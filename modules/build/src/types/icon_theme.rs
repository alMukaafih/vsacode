use std::collections::HashMap;

use serde::Deserialize;

#[derive(Deserialize, Debug, Default)]
#[serde(rename_all = "camelCase")]
pub struct DefinitionProperties {
    pub icon_path: Option<String>,
    pub font_character: Option<String>,
    pub font_color: Option<String>,
    pub font_size: Option<String>,
    pub font_id: Option<String>,
}

#[derive(Deserialize, Debug, Default)]
pub struct Src {
    path: String,
    format: String,
}

#[derive(Deserialize, Debug, Default)]
pub struct FontProperties {
    pub id: String,
    pub src: Vec<Src>,
    pub weight: Option<String>,
    pub style: Option<String>,
    pub size: Option<String>,
}

#[derive(Deserialize, Debug, Default)]
#[serde(rename_all = "camelCase")]
pub struct FileIconTheme {
    pub hides_explorer_arrows: Option<bool>,
    pub fonts: Option<Vec<FontProperties>>,
    pub icon_definitions: HashMap<String, DefinitionProperties>,
    pub file: Option<String>,
    pub folder: Option<String>,
    pub folder_expanded: Option<String>,
    pub folder_names: Option<HashMap<String, String>>,
    pub root_folder: Option<String>,
    pub root_folder_expanded: Option<String>,
    pub root_folder_names: Option<HashMap<String, String>>,
    pub root_folder_names_expanded: Option<HashMap<String, String>>,
    pub language_ids: Option<HashMap<String, String>>,

    pub file_extensions: Option<HashMap<String, String>>,
    pub file_names: Option<HashMap<String, String>>,
    //pub light: Option<HashMap<String, String>>,
    //pub high_contrast: Option<HashMap<String, String>>,
}