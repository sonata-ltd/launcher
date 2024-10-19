use std::{fs::File, io::ErrorKind};
use std::io::Write;
use std::fs::OpenOptions;
use serde_json::{json, Value};

use crate::instance::Paths;

use super::extract_filename;

pub fn recreate(file: &String) -> Result<(File, Value), String> {
    let instaces_list_default_struct: serde_json::Value = json!({
        "instances": []
    });

    match File::create(file) {
        Ok(mut file) => {
            file.write_all(serde_json::to_string_pretty(&instaces_list_default_struct).unwrap().as_bytes()).unwrap();
            Ok((file, instaces_list_default_struct))
        },
        Err(e) => Err(format!("Failed to create instances list file: {}", e)),
    }
}

pub fn add_to_registry(name: &str, paths: &Paths) -> Result<(), String> {
    let instances_list_file = match OpenOptions::new()
        .read(true)
        .write(false)
        .create(false)
        .open(&paths.instances_list_file) {
        Ok(file) => {
            println!("Instances list found");
            file
        },

        Err(e) => {
            if e.kind() == ErrorKind::NotFound {
                match recreate(&paths.instances_list_file) {
                    Ok(_) => {
                        match OpenOptions::new()
                            .read(true)
                            .write(false)
                            .create(false)
                            .open(&paths.instances_list_file) {
                                Ok(file) => file,
                                Err(e) => return Err(e.to_string()),
                            }
                    },

                    Err(e) => return Err(format!("Failed to create instances list file: {}", e))
                }
            } else {
                return Err(format!("Failed to open instances list file: {}", e));
            }
        }
    };
    let mut instances_list: serde_json::Value = serde_json::from_reader(&instances_list_file).unwrap();

    if let Some(instances) = instances_list["instances"].as_array_mut() {
        for item in instances.iter() {
            if let Some(config_path) = item.get("config") {
                if let Some(instance_name) = extract_filename(&config_path.to_string()) {
                    if name == instance_name {
                        println!("Instance with the same name is already exist");
                        return Ok(());
                    }
                }
            }
        }

        instances.push(json!({
            "config": format!("{}/{}.json", paths.headers, name),
            "folder": paths.instance
        }));

        let mut instances_list_file = File::create(&paths.instances_list_file).unwrap();
        instances_list_file.write_all(serde_json::to_string_pretty(&instances_list).unwrap().as_bytes()).unwrap();

    } else {
        return Err(format!("\"instances\" object not found in instances list file."));
    }


    Ok(())
}
