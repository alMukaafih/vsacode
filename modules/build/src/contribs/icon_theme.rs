use std::fs::File;
use std::io::BufReader;
use std::path::PathBuf;

use crate::types::env::JsEnv;
use crate::types::icon_theme::FileIconTheme;
use crate::types::package_json;

use super::Parser;

pub struct IconTheme {
    info: package_json::IconTheme,
    icon_json: FileIconTheme,
    env: JsEnv,
}

impl IconTheme {
    pub fn new(info: package_json::IconTheme, env: JsEnv) -> Self {
        Self { info, env, icon_json: Default::default() }
    }
}

impl Parser for IconTheme {
    fn parse(&mut self) -> napi::Result<()> {
        let mut path = PathBuf::from(&self.env.tmp_dir);
        path.push("extension");
        path.push(&self.info.path);

        let file = File::open(path);
        if file.is_err() {
            let err = file.err().unwrap();
            return Err(napi::Error::new(napi::Status::Unknown, format!("{}", err)));
        }
        let file = file.unwrap();

        let reader = BufReader::new(file);
        let path = PathBuf::from(&self.env.tmp_dir);

        let icon_json: serde_json::Result<FileIconTheme> = serde_json::from_reader(reader);
        if icon_json.is_err() {
            let err = icon_json.err().unwrap();
            return Err(napi::Error::new(napi::Status::Unknown, format!("{}", err)));
        }
        let icon_json = icon_json.unwrap();

        self.icon_json = icon_json;
        Ok(())
    }
}