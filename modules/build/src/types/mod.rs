use serde::Serialize;

pub(crate) mod fantasicon;
pub(crate) mod icon_theme;
pub mod env;
pub(crate) mod config;
pub(crate) mod package_json;
pub(crate) mod plugin_json;
pub(crate) mod svgo;
pub(crate) mod vsix_manifest;
pub(crate) mod webpack;

#[derive(Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct MetaJson {
    pub id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon_themes: Option<Vec<[String; 2]>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pro_themes: Option<Vec<[String; 2]>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub themes: Option<Vec<[String; 2]>>,
}
