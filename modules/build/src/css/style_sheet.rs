use std::{
    collections::HashMap,
    fmt::Display,
    fs::{copy, create_dir_all},
    path::PathBuf,
};

use crate::css::FolderType;
use crate::types::icon_theme::{Defs, Mapping};

use super::{font_rule::FontRule, StyleRule};

macro_rules! bundle {
    ( $sheet:expr, $path:expr, ) => {{
        let src = join!(&$sheet.route.0, $path);
        if !&$sheet.route.1.exists() {
            let _ = create_dir_all(&$sheet.route.1);
        }

        $sheet.count += 1;
        let dest = format!("{}.{}", $sheet.count, ext!($path));
        let _ = copy(&src, join!(&$sheet.route.1, &dest));
        dest
    }};

    ( $sheet:expr, $path:expr ) => {{
        format!("../1/{}", bundle!($sheet, $path,))
    }};
}

pub struct StyleSheet {
    font_rules: Vec<FontRule>,
    rules: HashMap<String, StyleRule>,
    pub route: (PathBuf, PathBuf),
    cache: Defs,
    count: i32,
}

impl StyleSheet {
    pub fn new(route: (PathBuf, PathBuf)) -> Self {
        Self {
            font_rules: vec![],
            rules: HashMap::with_capacity(1024),
            route,
            cache: HashMap::with_capacity(1024),
            count: -1,
        }
    }

    pub fn insert(&mut self, k: String, v: StyleRule) {
        if self.rules.contains_key(&k) {
            let rule = ok!(self.rules.get_mut(&k));
            rule.selectors.push(v.selectors[0].clone());
        } else {
            self.rules.insert(k, v);
        }
    }

    pub fn insert_fonts(&mut self, fonts: &Vec<FontRule>) {
        if self.font_rules.is_empty() {
            self.font_rules = fonts.clone();
            return;
        }

        for font in fonts {
            self.font_rules.push(font.clone());
        }
    }

    pub fn insert_css(&mut self, k: String, selector: String, defs: &mut Defs) {
        if k.is_empty() {
            return;
        }

        let def = {
            let def = defs.get(&k).cloned();
            if def.is_some() {
                defs.remove(&k);
                let def = ok!(def);
                self.cache.insert(own!(&k), def.clone());
                def
            } else {
                let def = self.cache.get(&k).cloned();
                if def.is_none() {
                    return;
                } else {
                    ok!(def)
                }
            }
        };

        self.insert(
            k,
            StyleRule::new(
                selector,
                def.font_character.clone(),
                def.icon_path.clone(),
                def.font_color.clone(),
                def.font_id.clone(),
                def.font_size.clone(),
            ),
        );
    }

    pub fn insert_folders_css(&mut self, folders: &Mapping, defs: &mut Defs, r#type: FolderType) {
        if folders.is_none() {
            return;
        }
        let folders = folders.as_ref().unwrap();

        for (key, value) in folders {
            let selector = match r#type {
                FolderType::Normal => {
                    format!("*[type^='dir'][name='{}'i]>.folder:before,", key)
                        + &format!(
                            ".list.collapsible.hidden>.tile[data-name='{}'i][data-type='dir']>.folder:before",
                            key
                        )
                }
                FolderType::Expanded => {
                    format!("*[data-name='{}'i][data-type='dir']>.folder:before", key)
                }
                FolderType::Root => {
                    format!(
                        ".list.collapsible.hidden>.tile[data-name='{}'i][data-type='root']>.folder:before",
                        key
                    )
                }
                FolderType::RootExpanded => {
                    format!("*[data-name='{}'i][data-type='root']>.folder:before", key)
                }
            };
            self.insert_css(value.clone(), selector, defs);
        }
    }

    pub fn contains(&self, k: &str) -> bool {
        self.rules.contains_key(k)
    }

    pub fn resolve_urls(&mut self) {
        for (_, style) in &mut self.rules {
            if style.url.is_some() {
                style.url = Some(bundle!(self, style.url.as_ref().unwrap()))
            }
        }

        for font in &mut self.font_rules {
            for src in &mut font.src {
                src.path = bundle!(self, &src.path)
            }
        }
    }

    pub fn bundle(&mut self, map: &Mapping, defs: &mut Defs) {
        if map.is_none() {
            return;
        }

        for (_, v) in ok!(map.as_ref()) {
            let def = defs.get_mut(v);
            if def.is_none() {
                continue;
            }
            let def = ok!(def);
            if def.is_bundled {
                continue;
            }

            if let Some(path) = def.icon_path.as_mut() {
                *path = bundle!(self, path.clone(),);
            }
            def.is_bundled = true;
        }
    }

    pub fn optimize(&mut self) -> &mut Self {
        self.resolve_urls();
        self
    }
}

impl Display for StyleSheet {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        for font in &self.font_rules {
            f.write_fmt(format_args!("{}", font))?;
        }
        //f.write_fmt(format_args!("{}", self.main))?;
        for (_, style) in &self.rules {
            f.write_fmt(format_args!("{}", style))?;
        }
        Ok(())
    }
}
