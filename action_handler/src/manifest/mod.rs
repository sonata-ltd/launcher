use crate::utils::download::download_in_json;

const GLOBAL_MANIFEST_URL: &'static str = "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json";

pub async fn get_global_manifest() -> Result<serde_json::Value, String> {
    match download_in_json(GLOBAL_MANIFEST_URL).await {
        Ok(data) => return Ok(data),
        Err(e) => return Err(e),
    }
}

pub async fn get_version_manifest(id: &str) -> Result<serde_json::Value, String> {
    match get_global_manifest().await {
        Ok(data) => {
            if let Some(versions) = data["versions"].as_array() {
                for version in versions {
                    if let Some(version_id) = version["id"].as_str() {
                        if version_id == id {
                            return Ok(version.to_owned());
                        }
                    }
                }
            }

            return Err("Failed to find required version".to_string());
        },
        Err(e) => Err(e),
    }
}
