use std::path::PathBuf;

use home::home_dir;

struct Config {
    launcher_root_dir: Option<PathBuf>
}

impl Config {
    pub fn get_default_values() -> Config {
        Config {
            launcher_root_dir: home_dir()
        }
    }
}
