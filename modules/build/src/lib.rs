#![allow(dead_code, unused_variables)]
use std::{fs::File, io::BufReader, path::PathBuf};

use contribs::{icon_theme::IconTheme, Parser};
use napi_derive::napi;
use types::{env::JsEnv, package_json::PackageJson};
use util::extract;

pub(crate) mod contribs;
mod types;
pub(crate) mod util;

/// Main Component.
#[napi]
pub struct Main {
    env: JsEnv,
}

#[napi]
impl Main {
    #[napi(constructor)]
    pub fn new(env: JsEnv) -> Self {
        Self { env }
    }

    #[napi]
    pub fn init(&self) -> napi::Result<()> {
        let result = extract(&self.env);
        if result.is_err() {
            let err = result.err().unwrap();
            return Err(napi::Error::new(napi::Status::Unknown, format!("{}", err)));
        }

        let mut path = PathBuf::from(&self.env.tmp_dir);
        path.push("extension");
        path.push("package.json");
        let file = File::open(path).unwrap();
        let reader = BufReader::new(file);
        let path = PathBuf::from(&self.env.tmp_dir);

        let package_json: serde_json::Result<PackageJson> = serde_json::from_reader(reader);
        if package_json.is_err() {
            let err = package_json.err().unwrap();
            return Err(napi::Error::new(napi::Status::Unknown, format!("{}", err)));
        }
        let package_json = package_json.unwrap();

        let contributes = package_json.contributes;
        if let Some(icon_themes) = contributes.icon_themes {
            for icon_theme in icon_themes {
                let env = self.env.clone();
                println!("{}", &icon_theme.label);
                let mut parser = IconTheme::new(icon_theme, env);
                parser.parse()?;
            }
        }

        Ok(())
    }
}