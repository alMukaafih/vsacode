use std::path::PathBuf;

use napi_derive::napi;

use crate::util::SrcInfo;

#[napi]
#[derive(PartialEq, Debug)]
pub enum ArgType {
    Flag,
    Param,
}

#[napi(object)]
#[derive(Clone, Debug)]
pub struct Arg {
    pub r#type: ArgType,
    pub key: String,
    pub value: Option<String>,
}

#[napi(object, js_name = "Env")]
#[derive(Clone)]
pub struct JsEnv {
    pub args: Vec<Arg>,
    pub home: String,
    pub is_debug: bool,
    pub tmp_dir: String,
}

#[derive(Clone, Debug)]
pub(crate) struct RsEnv {
    pub args: Vec<Arg>,
    pub build_dir: Option<String>,
    pub home: String,
    pub is_debug: bool,
    pub plugin_id: Option<String>,
    pub src_dir: Option<PathBuf>,
    pub src_info: Option<SrcInfo>,
    pub tmp_dir: String,
}

impl From<JsEnv> for RsEnv {
    fn from(env: JsEnv) -> Self {
        Self {
            args: env.args,
            build_dir: None,
            home: env.home,
            is_debug: env.is_debug,
            plugin_id: None,
            src_dir: None,
            src_info: None,
            tmp_dir: env.tmp_dir,
        }
    }
}
