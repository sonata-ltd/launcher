pub mod metacache;
pub mod instance_manifest;
pub mod instances_list;
pub mod download;


pub fn extract_filename(path: &str) -> Option<&str> {
    if let Some(filename) = path.rsplit('/').next() {
        if let Some(word) = filename.split('.').next() {
            return Some(word);
        }
    }

    None
}
