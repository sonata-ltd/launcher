use std::collections::HashMap;
// use std::env::consts::OS;
// use std::ffi::OsStr;
use std::fs::OpenOptions;
// use chrono::format;
// use home::env::OS_ENV;
use home::home_dir;
use std::io::ErrorKind;
use std::fs::create_dir_all;

pub mod download;
use async_std::{fs::File, io::WriteExt, fs::create_dir};
use download::libs;
use download::assets;
use download::manifest;
use serde_json::json;
use tide_websockets::WebSocketConnection;

pub mod launch;
pub mod list;

use crate::types::ws::send_ws_msg;
use crate::types::ws::InfoMessage;
use crate::types::ws::ProgressData;
use crate::types::ws::ProgressMessage;
use crate::types::ws::ProgressTarget;
use crate::types::ws::ProgressTargetsList;
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
    pub metacache_file: String,
}

pub struct Instance {
    pub name: String,
    pub url: String,
    pub info: HashMap<String, String>,
}

impl Instance {
    pub fn new(name: String, url: String, info: HashMap<String, String>) -> Instance {
        Instance {
            name,
            url,
            info
        }
    }

    pub async fn init(&mut self, ws: &WebSocketConnection) -> Result<String, String> {
        // Get default paths
        let paths = match get_required_paths(&self.name) {
            Ok(paths) => paths,
            Err(e) => return Err(e),
        };

        match create_dir_all(&paths.root) {
            Ok(_) => {
                println!("Launcher root directory initialized");

                let msg = InfoMessage {
                    message: format!("Root directory initialized successfully"),
                    message_id: format!("creation_root_success"),
                    timestamp: format!("Current Date"),
                };

                if let Err(e) = send_ws_msg(ws, json!(msg)).await {
                    println!("Error occured: {}", e);
                    return Err(e);
                }
            },
            Err(e) => {
                return Err(format!("{}", e));
            },
        };

        self.info.entry("${game_directory}".to_string()).or_insert_with(|| paths.instance.to_string());
        self.info.entry("${assets_root}".to_string()).or_insert_with(|| paths.assets.to_string());
        self.info.entry("${user_properties}".to_string()).or_insert_with(|| "{}".to_string());

        // Send stages list
        let mut list: Vec<String> = Vec::new();
        list.push("fetch_manifest".to_string());
        list.push("download_libs".to_string());
        list.push("download_assets".to_string());

        let msg = ProgressTargetsList {
            message_id: format!("progress_targets_list_transfer"),
            message_type: format!("PROGRESS_TARGETS_LIST"),
            timestamp: format!("Current Date"),
            ids_list: list,
        };

        if let Err(e) = send_ws_msg(ws, json!(msg)).await {
            println!("Error occured: {}", e);
            return Err(e);
        }


        // Get minecraft version manifest
        let verson_manifest: serde_json::Value;
        match manifest::download_manifest(&self.url, &paths.meta).await {
            Ok(data) => {
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

                verson_manifest = data
            },
            Err(e) => return Err(format!("Failed to download version manifest: {}", e))
        }

        // Download all libs needed by this version
        match libs::download_version_libs(&verson_manifest, &paths, &ws).await {
            Ok((dir, paths)) => {
                let mut paths_string = String::new();

                for path in paths.iter() {
                    paths_string.push_str(&path);
                }

                self.info.insert("${libs_directory}".to_string(), dir.to_string());
                self.info.insert("${classpath_libs_directories}".to_string(), paths_string);
            },
            Err(e) => return Err(format!("Failed to download and register libs: {e}"))
        };

        println!("Libs downloaded");

        // Get version assets manifest
        let assets_manifest_location = paths.assets.to_owned() + "/indexes";
        let assets_manifest = match manifest::get_assets_manifest(&verson_manifest, &assets_manifest_location).await {
            Ok((data, id)) => {
                self.info.insert("${assets_index_name}".to_string(), id.to_string());
                data
            },
            Err(e) => return Err(format!("Failed to download assets manifest: {}", e))
        };

        // Download all assets needed by this version
        let assets_objects_location = paths.assets.to_owned() + "/objects";
        assets::download_version_assets(&assets_manifest, &assets_objects_location, ws, &paths).await;

        // Initialize instance directory
        match Self::register_instance(&self, &paths).await {
            Ok(_) => {},
            Err(e) => return Err(format!("Failed to initialize instance directory: {}", e))
        };

        // launch::launch_instance(verson_manifest, &self.info, &paths).await;

        Ok(format!("asd"))
    }

    async fn register_instance(instance: &Instance, paths: &Paths) -> Result<(), String> {
        match create_dir(&paths.instance).await {
            Ok(_) => {
                println!("Created instance dir");

                match add_to_registry(&instance.name, &paths) {
                    Ok(_) => {},
                    Err(e) => return Err(e),
                };

                match gen_manifest(&instance, &paths) {
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
        metacache_file: format!("{}/metacache.json", root),
    })
}
