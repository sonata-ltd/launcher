use std::fs::{File, OpenOptions};
use std::io::{ErrorKind, Write};
use serde_json::{json, Value};

use crate::instance::{Instance, Paths};


pub fn recreate(file: &String) -> Result<(File, Value), String> {
    let instaces_list_default_struct: serde_json::Value = json!({});

    match File::create(file) {
        Ok(mut file) => {
            file.write_all(serde_json::to_string_pretty(&instaces_list_default_struct).unwrap().as_bytes()).unwrap();
            Ok((file, instaces_list_default_struct))
        },
        Err(e) => Err(format!("Failed to create instance manifest file: {}", e)),
    }
}

pub fn gen_manifest(instance: &Instance, paths: &Paths) -> Result<(), String> {
    let instance_manifest_file = match OpenOptions::new()
        .read(true)
        .write(false)
        .create(false)
        .open(&paths.instance_manifest_file) {
        Ok(file) => {
            println!("Instance manifest found");
            file
        },

        Err(e) => {
            if e.kind() == ErrorKind::NotFound {
                match recreate(&paths.instance_manifest_file) {
                    Ok(_) => {
                        match OpenOptions::new()
                            .read(true)
                            .write(false)
                            .create(false)
                            .open(&paths.instance_manifest_file) {
                                Ok(file) => file,
                                Err(e) => return Err(e.to_string()),
                            }
                    },

                    Err(e) => return Err(format!("Failed to create instance manifest file: {}", e))
                }
            } else {
                return Err(format!("Failed to open instance manifest file: {}", e));
            }
        }
    };

    let mut instance_manifest: serde_json::Value = match serde_json::from_reader(&instance_manifest_file) {
        Ok(value) => value,
        Err(_) => json!({})
    };

    instance_manifest["general"] = json!({
        "name": instance.name,
        "version": "idk",
        "loader": "vanilla",
        "playtime": "0"
    });

    instance_manifest["java"] = json!({
        "path": "",
        "custom_options": ""
    });

    let mut instance_manifest_file = File::create(&paths.instance_manifest_file).unwrap();
    instance_manifest_file.write_all(serde_json::to_string_pretty(&instance_manifest).unwrap().as_bytes()).unwrap();

    Ok(())
}
