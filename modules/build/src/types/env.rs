use napi_derive::napi;

#[napi(object, js_name = "Env")]
#[derive(Clone)]
pub struct JsEnv {
    pub build_dir: Option<String>,
    pub current_dir: String,
    pub flags: Vec<String>,
    pub home: String,
    pub tmp_dir: String,
    pub vsix_path: String,
}