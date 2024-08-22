use std::{
    collections::HashMap,
    fs::{copy, create_dir_all},
    path::PathBuf,
};

use crate::types::{
    env::RsEnv,
    icon_theme::{DefinitionProperties, FontProperties},
};

pub type Defs = HashMap<String, DefinitionProperties>;

pub struct CSS {
    env: RsEnv,
    cache: HashMap<String, DefinitionProperties>,
    path: PathBuf,
}

impl CSS {
    pub fn new(env: RsEnv, path: PathBuf) -> Self {
        Self {
            env,
            cache: Default::default(),
            path,
        }
    }

    fn bundle_asset(&mut self, path: PathBuf, trim: bool) -> String {
        let path = join!(&self.path, &path);
        if !path.exists() {
            return own!("null");
        }
        let assets_dir = join!(ok!(self.env.build_dir.as_ref()), "dist", "assets");
        if !assets_dir.exists() {
            let _ = create_dir_all(&assets_dir);
        }

        let _ = copy(&path, join!(assets_dir, ok!(path.file_name())));
        if trim {
            ok!(path.file_name()).to_string_lossy().to_string()
        } else {
            format!("../assets/{}", ok!(path.file_name()).to_string_lossy())
        }
    }

    pub fn generate_css(&mut self, name: &str, selector: &str, defs: &mut Defs) -> String {
        //self.cache.clear();
        if name == "null" {
            return own!("");
        }
        let def = {
            let def = defs.get(name).cloned();
            if def.is_some() {
                defs.remove(name);
                let def = ok!(def);
                self.cache.insert(own!(name), def.clone());
                def
            } else {
                let def = self.cache.get(name).cloned();
                if def.is_none() {
                    return own!("");
                } else {
                    ok!(def)
                }
            }
        };

        let icon_path = if let Some(val) = def.icon_path.clone() {
            let p = path!(val);
            let path = self.bundle_asset(p, false);
            if &path == "null" {
                return String::new();
            }
            format!("background-image:url({});", path)
        } else {
            own!("")
        };

        let font_char = if let Some(val) = def.font_character.clone() {
            val
        } else {
            own!("")
        };

        let font_color = if let Some(val) = def.font_color.clone() {
            format!("color:{val};")
        } else {
            own!("")
        };

        let font_id = if let Some(val) = def.font_id.clone() {
            format!("font-family:\"{val}\"!important;")
        } else {
            own!("")
        };

        let font_size = if let Some(val) = def.font_size.clone() {
            format!("font-size:{val};")
        } else {
            own!("")
        };

        format!(
            "{}{{content:\"{}\"!important;{}}}",
            selector,
            font_char,
            font_color + &font_id + &font_size + &icon_path
        )
    }

    pub fn generate_fonts_css(&mut self, fonts: &Vec<FontProperties>) -> String {
        let mut css = String::new();
        for font in fonts {
            let mut srcs = vec![];
            for src in &font.src {
                let mut p = PathBuf::new();
                p.push(&src.path);
                srcs.push(format!(
                    "url({})format(\"{}\")",
                    self.bundle_asset(p, false),
                    src.format
                ));
            }

            let font_weight = if let Some(val) = font.weight.clone() {
                format!("font-weight:{val};")
            } else {
                own!("")
            };

            let font_style = if let Some(val) = font.style.clone() {
                format!("font-style:{val};")
            } else {
                own!("")
            };

            let font_size = if let Some(val) = font.size.clone() {
                format!("font-size:{val};")
            } else {
                own!("")
            };

            css = css
                + "@font-face{"
                + &format!("font-family:\"{}\";", font.id)
                + &format!("src:{};", srcs.join(","))
                + &font_weight
                + &font_style
                + &font_size
                + "}";
        }

        css
    }

    pub fn generate_folders_css(
        &mut self,
        folders: &Option<HashMap<String, String>>,
        defs: &mut Defs,
        r#type: FolderType,
    ) -> String {
        if folders.is_none() {
            return String::new();
        }
        let folders = folders.as_ref().unwrap();
        let mut css = String::new();

        for (key, value) in folders {
            let selector = match r#type {
                FolderType::Normal => {
                    format!("*[type^=\"dir\"][name=\"{}\"i]>.folder::before,", key)
                        + &format!(
                            ".hidden>*[data-name=\"{}\"i][data-type=\"dir\"]>.folder::before",
                            key
                        )
                }
                FolderType::Expanded => {
                    format!(
                        "*[data-name=\"{}\"i][data-type=\"dir\"]>.folder::before",
                        key
                    )
                }
                FolderType::Root => {
                    format!(
                        ".hidden>*[data-name=\"{}\"i][data-type=\"root\"]>.folder::before",
                        key
                    )
                }
                FolderType::RootExpanded => {
                    format!(
                        "*[data-name=\"{}\"i][data-type=\"root\"]>.folder::before",
                        key
                    )
                }
            };
            css += &self.generate_css(value, &selector, defs);
        }

        css
    }

    pub fn bundle(&mut self, defs: &mut Defs) {
        for (_, v) in defs {
            if let Some(path) = &v.icon_path {
                let p = path!(path);
                let path = self.bundle_asset(p, true);
                v.icon_path.replace(path);
            }
        }
    }
}

pub enum FolderType {
    Normal,
    Expanded,
    Root,
    RootExpanded,
}
