use std::fs::{create_dir, File};
use std::io::Write;

use serde::Serialize;

use crate::types::plugin_json::PluginJson;
use crate::types::MetaJson;

/// Generate $BUILD_DIR/src/.meta.json
pub fn meta_json(meta_json: MetaJson, build_dir: &str) {
    let mut out = ok!(File::create(join!(build_dir, "src", ".meta.json")));
    let _ = write!(out, "{}", ok!(serde_json::to_string(&meta_json)));
}

pub fn main(content: &str, build_dir: &str) {
    let mut out = ok!(File::create(join!(build_dir, "src", "main.js")));
    let _ = write!(out, "{content}");
}

pub fn contrib_main(name: &str, content: &str, build_dir: &str) {
    let mut out = ok!(File::create(join!(build_dir, "src", format!("{name}.js"))));
    let _ = write!(out, "{content}");
}

pub fn contrib<S: Serialize>(folder: &str, name: &str, json: &S, build_dir: &str) {
    let mut path = join!(build_dir, "src", format!("{folder}"));
    if !path.exists() {
        let _ = create_dir(&path);
    }
    let mut p1 = path.clone();
    p1.push(format!("{name}.json"));
    let mut out = ok!(File::create(p1));
    let _ = write!(out, "{}", ok!(serde_json::to_string(json)));

    path.push(format!("{name}.js"));
    let mut out = ok!(File::create(path));
    let _ = write!(
        out,
        "import json from \"./{name}.json\";\n{}",
        "export const content = json;"
    );
}

pub fn plugin_json(p: PluginJson, build_dir: &str) {
    let mut out = ok!(File::create(join!(build_dir, "dist", "plugin.json")));
    let _ = write!(out, "{}", ok!(serde_json::to_string(&p)));
}
