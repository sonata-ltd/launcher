use std::{collections::HashMap, fmt::format, fs::{File, OpenOptions}, path::PathBuf, thread::sleep, time::Duration};
use serde_json::json;

use async_std::path::Path;
use tide_websockets::WebSocketConnection;

use crate::{types::ws::{send_ws_msg, InfoMessage, ScanData, ScanInfo, ScanIntegrity, ScanMessage}, utils::instances_list};

pub struct List {
    manifest_location: String,
}

impl List {
    pub fn new(manifest_location: String) -> List {
        List {
            manifest_location
        }
    }

    fn extract_instance_data(config: &str) -> Option<ScanInfo> {
        let instance_manifest_file = OpenOptions::new()
            .read(true)
            .write(false)
            .create(false)
            .open(config).ok()?;

        let instance_manifest: serde_json::Value = match serde_json::from_reader(&instance_manifest_file) {
            Ok(value) => value,
            Err(_) => {
                return None;
            },
        };

        if let Some(general) = instance_manifest.get("general").and_then(|v| v.as_object()) {
            // Safely retrieve name, version, and loader
            let name = general.get("name").and_then(|v| v.as_str())?;
            let version = general.get("version").and_then(|v| v.as_str())?;
            let loader = general.get("loader").and_then(|v| v.as_str())?;

            Some(ScanInfo {
                name: name.to_string(),
                version: version.to_string(),
                loader: loader.to_string(),
            })
        } else {
            None
        }
    }

    pub async fn start_paths_checking(&self, ws: &WebSocketConnection) -> Result<String, String> {
        let main_manifest_file = OpenOptions::new()
            .read(true)
            .write(true)
            .create(true)
            .open(&self.manifest_location).unwrap();

        let main_manifest = match serde_json::from_reader(&main_manifest_file) {
            Ok(value) => value,
            Err(_) => {
                match instances_list::recreate(&self.manifest_location) {
                    Ok((_file, value)) => {
                        println!("File not found, recreated");
                        value
                    },
                    Err(e) => {
                        println!("Failed to recreate instances main manifest file: {}", e);
                        return Err(format!("Failed to recreate instances main manifest file: {e}"));
                    }
                }
            }
        };

        if let Some(instances) = main_manifest["instances"].as_array() {
            // HashMap contains:
            // instance_manifest_path, instance_manifest_exist | instance_path, instance_exist
            // let mut instances_exists: HashMap<(&str, bool), (&str, bool)> = HashMap::new();

            for item in instances {
                if let (Some(config), Some(folder)) = (item["config"].as_str(), item["folder"].as_str()) {
                    let manifest_exist = Path::new(config).exists().await;
                    let instance_exist = Path::new(folder).exists().await;

                    // Get ScanInfo data if the instance manifest exists and is not corrupted
                    let scan_info = Self::extract_instance_data(&config);

                    let msg = ScanMessage {
                        message_id: format!("scan_instance_complete"),
                        timestamp: format!("Currect Date"),
                        target: ScanData {
                            integrity: ScanIntegrity {
                                manifest_path: String::from(config),
                                manifest_exist,
                                instance_path: String::from(folder),
                                instance_exist,
                            },
                            info: scan_info
                        }
                    };

                    if let Err(e) = send_ws_msg(ws, json!(msg)).await {
                        println!("Failed to send update info, {e}");
                    }
                }
            }

            let msg = InfoMessage {
                message: format!("Scan Complete"),
                message_id: format!("scan_complete"),
                timestamp: format!("Currect Date"),
            };

            if let Err(e) = send_ws_msg(ws, json!(msg)).await {
                println!("Failed to send update info, {e}");
            }

            return Ok(format!("{:#?}", instances));
        } else {
            println!("Not found");
            return Err(format!("Not found"));
        }
    }
}
