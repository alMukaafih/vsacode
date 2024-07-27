use serde::Deserialize;

#[derive(Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct IconTheme {
    pub id: String,
    pub label: String,
    pub path: String,
}

#[derive(Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Contributes {
    pub icon_themes: Option<Vec<IconTheme>>,
}

#[derive(Deserialize, Clone)]
#[serde(untagged)]
pub enum Author {
    String(String),
    Object { email: String, name: String },
}

#[derive(Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PackageJson {
    pub name: String,
    pub display_name: String,
    pub description: String,
    pub version: String,
    pub publisher: String,
    pub author: Author,
    pub contributes: Contributes,
    pub icon: String,
}