use std::collections::HashMap;

use serde::{ser::SerializeStruct, Deserialize, Serialize};
use serde_json::Value;

#[derive(Deserialize, Serialize, Debug, Default, Clone)]
#[serde(rename_all(deserialize = "camelCase"))]
pub struct DefinitionProperties {
    #[serde(skip_serializing_if = "Option::is_none", rename(serialize = "0"))]
    pub icon_path: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none", rename(serialize = "1"))]
    pub font_character: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none", rename(serialize = "2"))]
    pub font_color: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none", rename(serialize = "3"))]
    pub font_size: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none", rename(serialize = "4"))]
    pub font_id: Option<String>,
}

#[derive(Deserialize, Serialize, Debug, Default)]
pub struct Src {
    #[serde(rename(serialize = "0"))]
    pub path: String,
    #[serde(rename(serialize = "1"))]
    pub format: String,
}

#[derive(Deserialize, Serialize, Debug, Default)]
pub struct FontProperties {
    pub id: String,
    pub src: Vec<Src>,
    pub weight: Option<String>,
    pub style: Option<String>,
    pub size: Option<String>,
}

#[derive(Deserialize, Debug, Default)]
#[serde(rename_all(deserialize = "camelCase"))]
pub struct IFileIconTheme {
    pub hides_explorer_arrows: Option<bool>,
    pub fonts: Option<Vec<FontProperties>>,
    pub icon_definitions: HashMap<String, DefinitionProperties>,
    pub file: Option<String>,
    pub folder: Option<String>,
    pub folder_expanded: Option<String>,
    pub folder_names: Option<HashMap<String, String>>,
    pub folder_names_expanded: Option<HashMap<String, String>>,
    pub root_folder: Option<String>,
    pub root_folder_expanded: Option<String>,
    pub root_folder_names: Option<HashMap<String, String>>,
    pub root_folder_names_expanded: Option<HashMap<String, String>>,
    pub language_ids: Option<HashMap<String, String>>,

    pub file_extensions: Option<HashMap<String, String>>,
    pub file_names: Option<HashMap<String, String>>,
    pub light: Option<HashMap<String, Value>>,
    pub high_contrast: Option<HashMap<String, Value>>,
}

macro_rules! skip_if_none {
    ( $state:expr , $key:expr, $value:expr ) => {
        if $value.is_some() {
            $state.serialize_field($key, &$value)?;
        }
    };

    ( $state:expr , $key:expr, $value:expr, $map:expr ) => {
        if $value.is_some() {
            let new_map = IFileIconTheme::link_map(&$value.as_ref().unwrap(), &$map);
            $state.serialize_field($key, &new_map)?;
        }
    };
}

type Map = HashMap<String, i32>;
type DefsMap = HashMap<i32, DefinitionProperties>;

impl IFileIconTheme {
    fn minify_icon_defs(&self) -> (Map, DefsMap) {
        let mut defsmap = DefsMap::new();
        let mut map = HashMap::new();
        let mut i = 0;
        for (k, v) in &self.icon_definitions {
            map.insert(k.clone(), i);
            defsmap.insert(i, v.clone());
            i += 1;
        }
        (map, defsmap)
    }

    fn link_map(from: &HashMap<String, String>, to: &Map) -> Map {
        let mut map = Map::new();
        for (k, v) in from {
            let val = to.get(v);
            if let Some(val) = val {
                map.insert(own!(k), *val);
            }
        }
        map
    }
}

impl Serialize for IFileIconTheme {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let (map, defsmap) = Self::minify_icon_defs(&self);
        let mut state = serializer.serialize_struct("IFileIconTheme", 5)?;
        state.serialize_field("0", &defsmap)?;
        skip_if_none!(state, "1", self.file_extensions, map);
        skip_if_none!(state, "2", self.file_names, map);
        state.end()
    }
}
