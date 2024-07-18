use napi_derive::napi;

#[napi(object, js_name = "Env")]
pub struct JsEnv {
    pub config_path: Option<String>,
    pub cli_args: Vec<String>,
    pub home: String,
    pub vsix_path: Option<String>,
}