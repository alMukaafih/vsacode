use std::fs::File;
use std::io::{BufReader, Write};
use std::path::PathBuf;

use crate::css::StyleSheet;
use crate::types::env::RsEnv;
use crate::types::icon_theme::IFileIconTheme;
use crate::types::package_json::IconThemeMeta;
use crate::css::FolderType;
use crate::util::{filter, vs_to_ace};

use super::Parser;

macro_rules! verify {
    ( $x:expr, $defs:expr ) => {{
        if $x.is_some() {
            if $defs.get(ok!($x.as_ref())).is_none() {
                $x = None;
            }
        }
    }};
}

macro_rules! ok_or {
    ( $x:expr, $y:expr ) => {{
        if $x.is_some() {
            ok!($x.as_ref()).clone()
        } else {
            $y
        }
    }};
}

pub struct IconThemeParser {
    pub meta: IconThemeMeta,
    pub icon_json: IFileIconTheme,
    pub env: RsEnv,
    pub root: PathBuf,
    pub sheet: StyleSheet,
}

impl IconThemeParser {
    pub fn new(env: RsEnv) -> Self {
        Self {
            meta: Default::default(),
            env: env.clone(),
            icon_json: Default::default(),
            root: Default::default(),
            sheet: StyleSheet::new((
                Default::default(),
                join!(ok!(env.build_dir.as_ref()), "dist", "1"),
            )),
        }
    }

    pub fn set_meta(&mut self, meta: IconThemeMeta) {
        self.meta = meta;
    }

    fn generate_styles(&mut self) -> String {
        let defs = &mut self.icon_json.icon_definitions;

        verify!(self.icon_json.file, defs);
        verify!(self.icon_json.folder, defs);
        verify!(self.icon_json.folder_expanded, defs);
        verify!(self.icon_json.root_folder, defs);
        verify!(self.icon_json.root_folder_expanded, defs);

        let file = ok_or!(self.icon_json.file, own!(""));
        let folder = ok_or!(self.icon_json.folder, own!(""));
        let folder_expanded = ok_or!(self.icon_json.folder_expanded, folder.clone());

        let root_folder = ok_or!(self.icon_json.root_folder, folder.clone());
        let root_folder_expanded = if self.icon_json.root_folder.is_some() {
            ok_or!(self.icon_json.root_folder_expanded, root_folder.clone())
        } else {
            ok_or!(self.icon_json.root_folder_expanded, folder_expanded.clone())
        };

        self.sheet.route.0 = self.root.clone();
        let sheet = &mut self.sheet;

        if self.icon_json.fonts.is_some() {
            sheet.insert_fonts(ok!(self.icon_json.fonts.as_ref()))
        }
        sheet.insert_css(file, own!(".file_type_default:before"), defs);

        sheet.insert_css(
            folder.clone(),
            own!(".list.collapsible.hidden>.tile[data-type='dir']>.folder:before"),
            defs,
        );

        sheet.insert_css(folder, own!("*[type^='dir']>.folder:before"), defs);

        sheet.insert_css(
            folder_expanded.clone(),
            own!("*[data-type='dir']>.folder:before"),
            defs,
        );

        sheet.insert_css(
            root_folder,
            own!(".list.collapsible.hidden>.tile[data-type='root']>.folder:before"),
            defs,
        );

        sheet.insert_css(
            root_folder_expanded,
            own!("*[data-type='root']>.folder:before"),
            defs,
        );

        sheet.insert_folders_css(&self.icon_json.folder_names, defs, FolderType::Normal);

        if self.icon_json.folder_expanded.is_some() {
            sheet.insert_folders_css(
                &self.icon_json.folder_names_expanded,
                defs,
                FolderType::Expanded,
            );
        } else {
            sheet.insert_folders_css(
                &self.icon_json.folder_names,
                defs,
                FolderType::Expanded,
            );
        }

        sheet.insert_folders_css(&self.icon_json.root_folder_names, defs, FolderType::Root);

        sheet.insert_folders_css(
            &self.icon_json.root_folder_names_expanded,
            defs,
            FolderType::RootExpanded,
        );

        self.icon_json.fonts = None;
        self.icon_json.file = None;
        self.icon_json.folder = None;
        self.icon_json.folder_expanded = None;
        self.icon_json.root_folder = None;
        self.icon_json.root_folder_expanded = None;
        self.icon_json.folder_names = None;
        self.icon_json.folder_names_expanded = None;
        self.icon_json.root_folder_names = None;
        self.icon_json.root_folder_names_expanded = None;

        vs_to_ace(&mut self.icon_json.language_ids);

        sheet.bundle(&self.icon_json.file_extensions, defs);
        sheet.bundle(&self.icon_json.file_names, defs);
        sheet.bundle(&self.icon_json.language_ids, defs);
        filter(defs);

        format!("{}", sheet.optimize())
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
            "0",
            format!("{}.css", &self.meta.id)
        )));
        let _ = write!(out, "{}", self.generate_styles());

        Ok(())
    }
}
