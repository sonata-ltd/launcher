use std::collections::HashMap;
use download::manifest;
use home::home_dir;
use serde::Deserialize;
use std::fs::create_dir_all;

pub mod download;
use async_std::fs::create_dir;
use download::libs;
use download::assets;
use serde_json::json;
use tide_websockets::WebSocketConnection;

pub mod launch;
pub mod list;

use crate::messsages::BaseMessage;
use crate::types::ws::send_ws_msg;
use crate::types::ws::InfoMessage;
use crate::types::ws::ProgressData;
use crate::types::ws::ProgressMessage;
use crate::types::ws::ProgressTarget;
use crate::types::ws::ProgressTargetsList;
use crate::types::ws::ScanData;
use crate::types::ws::ScanInfo;
use crate::types::ws::ScanIntegrity;
use crate::types::ws::ScanMessage;
use crate::utils::instance_manifest::gen_manifest;
use crate::utils::instances_list::add_to_registry;

pub struct Paths {
    pub root: String,
    pub libs: String,
    pub assets: String,
    pub instance: String,
    pub instance_manifest_file: String,
    pub instances_list_file: String,
    pub headers: String,
    pub meta: String,
    pub version_manifest_file: Option<String>,
    pub metacache_file: String,
}

pub struct InstanceInfo {
    pub version: String,
}

#[derive(Debug, Deserialize)]
pub struct Instance {
    pub name: String,
    pub url: String,
    pub info: Option<HashMap<String, String>>,
}

impl<'a> Instance {
    pub fn new(name: String, url: String, info: Option<HashMap<String, String>>) -> Instance {
        Instance {
            name,
            url,
            info
        }
    }

    pub async fn init_or_run(&mut self, ws: &WebSocketConnection) -> Result<serde_json::Value, String> {
        // Get default paths
        let mut paths = match get_required_paths(&self.name) {
            Ok(paths) => paths,
            Err(e) => return Err(e),
        };

        // TODO: Move to external function
        // match create_dir_all(&paths.root) {
        //     Ok(_) => {
        //         println!("Launcher root directory initialized");

        //         let msg = InfoMessage {
        //             message: format!("Root directory initialized successfully"),
        //             message_id: format!("creation_root_success"),
        //             timestamp: format!("Current Date"),
        //         };

        //         if let Err(e) = send_ws_msg(ws, json!(msg)).await {
        //             println!("Error occured: {}", e);
        //             return Err(e);
        //         }
        //     },
        //     Err(e) => {
        //         return Err(format!("{}", e));
        //     },
        // };

        // Update launch args if info is not None
        self.update_info("${game_directory}", paths.instance.to_string());
        self.update_info("${assets_root}", paths.assets.to_string());
        self.update_info("${user_properties}", "{}".to_string());


        // Send stages list
        let list: Vec<String> = vec![
            "fetch_manifest".to_string(),
            "download_libs".to_string(),
            "download_assets".to_string()
        ];

        let msg = ProgressTargetsList {
            message_id: format!("progress_targets_list_transfer"),
            message_type: format!("PROGRESS_TARGETS_LIST"),
            timestamp: format!("Current Date"),
            ids_list: list,
        };

        if let Err(e) = send_ws_msg(ws, json!(msg)).await {
            println!("Error occured: {}", e);
            return Err(e.to_string());
        }


        // Get minecraft version manifest - Stage 1
        // TODO: Find already downloaded manifest and redownload
        // it if outdated
        let version_manifest = match manifest::download_manifest(&self.url, &paths.meta).await {
            Ok((data, path_to_manifest)) => {
                let msg = ProgressMessage {
                    message_id: format!("stage_complete"),
                    timestamp: format!("Current Date"),
                    data: ProgressData {
                        stage: "fetch_manifest".to_string(),
                        determinable: false,
                        progress: None,
                        max: 0,
                        status: "COMPLETED".to_string(),
                        target_type: "".to_string(),
                        target: ProgressTarget::File {
                            status: "".to_string(),
                            name: "".to_string(),
                            size_bytes: 0,
                        },
                    },
                };

                if let Err(e) = send_ws_msg(ws, json!(msg)).await {
                    return Err(e);
                }

                // Update info in Paths structure for instance manifest generation
                paths.version_manifest_file = path_to_manifest;

                data
            },
            Err(e) => return Err(format!("Failed to download version manifest: {}", e))
        };


        // Sync & download all libs needed by this version - Stage 2
        match libs::sync_libs(&version_manifest, &paths, &ws).await {
            Ok((dir, paths)) => {
                let mut paths_string = String::new();

                for path in paths.iter() {
                    paths_string.push_str(&path);
                }

                // Update launch args if info is not None
                self.update_info("${libs_directory}", dir.to_string());
                self.update_info("${classpath_libs_directories}", paths_string);
            },
            Err(e) => return Err(format!("Failed to download and register libs: {e}"))
        };


        // Get version assets manifest
        let assets_manifest_location = paths.assets.to_owned() + "/indexes";
        println!("{}", version_manifest);
        let assets_manifest = match manifest::get_assets_manifest(&version_manifest, &assets_manifest_location).await {
            Ok((data, id)) => {
                self.update_info("${assets_index_name}", id.to_string());
                data
            },
            Err(e) => return Err(format!("Failed to download assets manifest: {}", e))
        };


        // Sync & download all assets needed by this version - Stage 3
        let assets_objects_location = paths.assets.to_owned() + "/objects";
        assets::sync_assets(&assets_manifest, &assets_objects_location, ws, &paths).await;


        // Initialize instance directory
        let instance_version = match version_manifest["id"].as_str() {
            Some(data) => {
                InstanceInfo {
                    version: data.to_string(),
                }
            },
            None => return Err("Failed to determine version".to_string())
        };

        match Self::register_instance(&self, &paths, &instance_version).await {
            Ok(_) => {},
            Err(e) => return Err(format!("Failed to initialize instance directory: {}", e))
        };


        // Launch if self.info is not None
        if let Some(info) = &self.info {
            launch::launch_instance(version_manifest, info, &paths).await;

            let msg = InfoMessage {
                message: format!("instance running"),
                message_id: format!("process_finished"),
                timestamp: format!("Current Data"),
            };

            return Ok(json!(msg));
        } else {
            let msg = ScanMessage {
                message_id: format!("process_finished"),
                timestamp: format!("Current Data"),
                target: ScanData {
                    integrity: ScanIntegrity {
                        manifest_path: paths.instance_manifest_file,
                        manifest_exist: true,
                        instance_path : paths.instance,
                        instance_exist: true,
                    },
                    info: Some(ScanInfo {
                        name: format!("{}", self.name),
                        version: format!("asd"),
                        loader: format!("vanilla")
                    })
                }
            };

            return Ok(json!(msg));
        }
    }


    fn update_info(&mut self, k: &'a str, v: String) {
        if let Some(info_map) = &mut self.info {
            info_map.insert(k.to_string(), v);
        }
    }

    async fn register_instance
    (
        instance: &Instance,
        paths: &Paths,
        instance_info: &InstanceInfo
    ) -> Result<(), String>
    {
        match create_dir(&paths.instance).await {
            Ok(_) => {
                println!("Created instance dir");

                match add_to_registry(&instance.name, &paths) {
                    Ok(_) => {},
                    Err(e) => return Err(e),
                };

                match gen_manifest(&instance, &paths, &instance_info) {
                    Ok(_) => {},
                    Err(e) => return Err(e),
                };

                Ok(())
            },
            Err(e) => {
                return Err(e.to_string());
            }
        }
    }
}

// Return Libs path, Assets path, Instances path
fn get_required_paths(instance_name: &String) -> Result<Paths, String> {
    let root = match home_dir() {
        Some(path) => {
            format!("{}/.sonata", path.display())
        },
        None => return Err("Failed to get home directory".to_string()),
    };

    Ok(Paths {
        root: root.to_string(),
        libs: format!("{}/libraries", root),
        assets: format!("{}/assets", root),
        instance: format!("{}/instances/{}", root, instance_name),
        instance_manifest_file: format!("{}/headers/{}.json", root, instance_name),
        instances_list_file: format!("{}/headers/main.json", root),
        headers: format!("{}/headers", root),
        meta: format!("{}/meta", root),
        version_manifest_file: None,
        metacache_file: format!("{}/metacache.json", root),
    })
}
