use napi_derive::napi;

#[napi]
pub struct Config {
    pub version: String,
}