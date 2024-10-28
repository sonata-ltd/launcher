use async_std::{fs::{self, File}, io::WriteExt};

use crate::utils::download::download_in_json;

pub async fn download_manifest(url: &str, save_path: &str) -> Result<(serde_json::Value, Option<String>), String> {
    match download_in_json(url).await {
        Ok(data) => {
            println!("Version manifest downloaded");

            if !save_path.is_empty() {
                let name_start_pos = url.rfind('/').unwrap();
                let full_path = format!("{}{}", save_path, url[name_start_pos..].to_string());
                let dir_last_pos = full_path.rfind('/').unwrap();

                match fs::create_dir_all(full_path[..dir_last_pos].to_string()).await {
                    Ok(_) => {
                        let mut index_file = File::create(&full_path).await.unwrap();
                        index_file.write_all(serde_json::to_string_pretty(&data).unwrap().as_bytes()).await.unwrap();
                    },
                    Err(e) => return Err(format!("Failed to create dir: {}", e)),
                }

                return Ok((data, Some(full_path)));
            }

            Ok((data, None))
        },
        Err(e) => Err(format!("Failed to parse JSON: {}", e)),
    }
}

pub async fn get_assets_manifest<'a>(version_manifest: &'a serde_json::Value, assets_path: &'a str) -> Result<(serde_json::Value, &'a str), String> {
    if let Some(asset_index) = version_manifest["assetIndex"].as_object() {
        if let Some(asset_url) = asset_index["url"].as_str() {
            match download_manifest(&asset_url.to_string(), &assets_path) .await {
                Ok(manifest) => return Ok((manifest.0, asset_index["id"].as_str().unwrap())),
                Err(e) => return Err(format!("Failed to download assets manifest: {}", e)),
            };
        }
    }

    Err(format!("Failed to parse version manifest"))
}

pub async fn is_asset_downloaded(manifest: &serde_json::Value, k: &String, v: &serde_json::Value) -> bool {
    if let Some(_hash) = v.get("hash") {
        if let Some(assets) = manifest["assets"].as_array() {
            for asset in assets {
                if let Some(asset_name) = asset["name"].as_str() {
                    println!("asset_name: {:#?} | k: {}, | v: {}", asset_name, k, v);
                } else {
                    println!("Asset not found");
                }
            }
        } else {
            println!("Assets array not found");
        }
    }

    true
}

pub fn is_array_exists(metacache: &serde_json::Value, key: &str) -> bool {
    metacache.get(key).map_or(false, |v| v.is_array())
}
