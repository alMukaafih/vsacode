use std::fs::File;
use std::io::{BufReader, Write};
use std::path::PathBuf;

use crate::types::env::RsEnv;
use crate::types::icon_theme::IFileIconTheme;
use crate::types::package_json::IconThemeMeta;
use crate::util::{FolderType, CSS};

use super::Parser;

pub struct IconThemeParser {
    pub meta: IconThemeMeta,
    pub icon_json: IFileIconTheme,
    pub env: RsEnv,
    pub root: PathBuf,
}

impl IconThemeParser {
    pub fn new(meta: IconThemeMeta, env: RsEnv) -> Self {
        Self {
            meta,
            env,
            icon_json: Default::default(),
            root: Default::default(),
        }
    }

    fn generate_styles(&mut self) -> String {
        let file = self.icon_json.file.get_or_insert(own!("null"));
        let folder = self.icon_json.folder.get_or_insert(own!("null"));
        let folder_expanded = self.icon_json.folder_expanded.get_or_insert(folder.clone());
        let root_folder = self.icon_json.root_folder.get_or_insert(folder.clone());
        let root_folder_expanded = self
            .icon_json
            .root_folder_expanded
            .get_or_insert(root_folder.clone());

        let defs = &mut self.icon_json.icon_definitions;

        let mut css = CSS::new(self.env.clone(), self.root.clone());
        let mut styles = if self.icon_json.fonts.is_some() {
            css.generate_fonts_css(ok!(self.icon_json.fonts.as_ref()))
        } else {
            "".to_owned()
        };
        self.icon_json.fonts = None;
        styles = styles
            + ".file,.folder{"
            + "background-size:contain;"
            + "background-repeat:no-repeat;"
            + "display:inline-block;"
            + "height:1em;"
            + "width:1em;}";
        styles += &css.generate_css(file, ".file_type_default::before", defs);
        self.icon_json.file = None;

        styles += &css.generate_css(folder, ".hidden>*[data-type=\"dir\"]>.folder::before", defs);
        styles += &css.generate_css(folder, "*[type^=\"dir\"]>.folder::before", defs);
        self.icon_json.folder = None;

        styles += &css.generate_css(
            folder_expanded,
            "*[data-type=\"dir\"]>.folder::before",
            defs,
        );
        self.icon_json.folder_expanded = None;

        styles += &css.generate_css(
            root_folder,
            ".hidden>*[data-type=\"root\"]>.folder::before",
            defs,
        );
        self.icon_json.root_folder = None;

        styles += &css.generate_css(
            root_folder_expanded,
            "*[data-type=\"root\"]>.folder::before",
            defs,
        );
        self.icon_json.root_folder_expanded = None;

        styles += &css.generate_folders_css(&self.icon_json.folder_names, defs, FolderType::Normal);
        self.icon_json.folder_names = None;

        styles += &css.generate_folders_css(
            &self.icon_json.folder_names_expanded,
            defs,
            FolderType::Expanded,
        );
        self.icon_json.folder_names_expanded = None;

        styles +=
            &css.generate_folders_css(&self.icon_json.root_folder_names, defs, FolderType::Root);
        self.icon_json.root_folder_names = None;

        styles += &css.generate_folders_css(
            &self.icon_json.root_folder_names_expanded,
            defs,
            FolderType::RootExpanded,
        );
        self.icon_json.root_folder_names_expanded = None;

        css.bundle(defs);

        styles
    }
}

impl Parser for IconThemeParser {
    fn parse(&mut self) -> napi::Result<()> {
        let path = join!(ok!(&self.env.src_dir.as_ref()), &self.meta.path);

        self.root = own!(ok!(path.parent()));
        let file = File::open(path);
        if file.is_err() {
            throw!(ok!(file.err()));
        }
        let file = ok!(file);

        let reader = BufReader::new(file);

        let icon_json: serde_json::Result<IFileIconTheme> = serde_json::from_reader(reader);
        if icon_json.is_err() {
            throw!(ok!(icon_json.err()));
        }
        let icon_json = ok!(icon_json);

        self.icon_json = icon_json;
        let mut out = ok!(File::create(join!(
            ok!(self.env.build_dir.as_ref()),
            "dist",
            "iconThemes",
            format!("{}.css", &self.meta.id)
        )));
        let _ = write!(out, "{}", self.generate_styles());

        Ok(())
    }
}
