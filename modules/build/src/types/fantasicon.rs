use std::collections::HashMap;

use napi_derive::napi;

#[napi(object)]
#[derive(Clone)]
pub struct TtfOptions {
    pub url: String,
    pub description: String,
    pub version: String,
}

#[napi(object)]
#[derive(Clone)]
pub struct FormatOptions {
    pub ttf: Option<TtfOptions>,
}

#[napi(object)]
#[derive(Clone)]
pub struct RunnerOptions {
    pub name: String,
    pub prefix: String,
    pub codepoints: HashMap<String, i32>,
    pub input_dir: String,
    pub output_dir: String,
    #[napi(ts_type = "import(\"fantasticon\").FontAssetType[]")]
    pub font_types: Vec<String>,
    pub normalize: bool,
    pub format_options: FormatOptions,
}
