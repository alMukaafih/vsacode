#![allow(dead_code)]
use std::{
    env::current_dir,
    fs::{copy, create_dir_all, remove_dir_all, File},
    io::BufReader,
    path::PathBuf,
};

use napi::{
    bindgen_prelude::{Function, FunctionRef, Promise},
    Env, Error,
};
use napi_derive::napi;
use parser::{icon_theme::IconThemeParser, Parser};
use runtime::{Main, Runtime};
use types::{
    env::{JsEnv, RsEnv},
    fantasicon::RunnerOptions,
    package_json::PackageJson,
    plugin_json::PluginJson,
    svgo::SvgoConfig,
    webpack::{WebPackCache, WebPackConfig, WebPackOutput},
    MetaJson,
};
use util::{extract, get_src_info, pack, SrcType};

#[macro_use]
pub(crate) mod macros;
pub(crate) mod parser;
pub(crate) mod runtime;
mod types;
pub(crate) mod util;
pub(crate) mod write;
mod css;

/// Main Component.
#[napi]
pub struct Binding {
    env: RsEnv,
    fantasicon: FunctionRef<RunnerOptions, ()>,
    svgo: FunctionRef<(String, SvgoConfig), String>,
    webpack: FunctionRef<WebPackConfig, Promise<bool>>,
    main: bool,
}

#[napi]
impl Binding {
    #[napi(constructor)]
    pub fn new(
        env: JsEnv,
        fantasicon: Function<RunnerOptions, ()>,
        svgo: Function<(String, SvgoConfig), String>,
        webpack: Function<WebPackConfig, Promise<bool>>,
    ) -> Self {
        Self {
            env: RsEnv::from(env),
            fantasicon: fref!(fantasicon),
            svgo: fref!(svgo),
            webpack: fref!(webpack),
            main: false,
        }
    }

    #[napi]
    pub fn init(&mut self, env: Env) -> napi::Result<()> {
        let src_info = get_src_info(&self.env.args)?;
        match src_info.r#type {
            SrcType::Vsix => {
                self.env.src_info = Some(src_info.clone());
                let result = extract(&self.env);
                if result.is_err() {
                    throw_error!(InvalidArg, "invalid <u>vsix file</u>");
                }
                self.env.src_dir = Some(join!(&self.env.tmp_dir, "extension"))
            }
            SrcType::Dir => {
                self.env.src_dir = Some(src_info.path);
            }
        }

        if self.env.is_debug {
            println!("{:-?}", &self.env)
        }

        let path = join!(ok!(&self.env.src_dir.as_ref()), "package.json");
        let file = File::open(path);
        if file.is_err() {
            throw!(ok!(file.err()))
        }
        let file = ok!(file);

        let reader = BufReader::new(file);

        let package_json: serde_json::Result<PackageJson> = serde_json::from_reader(reader);
        if package_json.is_err() {
            throw!(ok!(package_json.err()));
        }
        let package_json = ok!(package_json);

        let plugin_json = PluginJson::from(package_json.clone());
        self.env.plugin_id = Some(package_json.name.clone());

        let b_code: &mut [bool] = &mut [false, false, false];
        let mut meta_json = MetaJson::default();
        meta_json.id = package_json.name.clone();

        let contribs = package_json.contributes;
        if let Some(icon_theme_metas) = contribs.icon_themes {
            self.main = true;
            b_code[0] = true;

            self.create_build_dir(package_json.name);
            self.create_contrib_dir("iconThemes", 0);

            let mut list = vec![];

            let mut parser = IconThemeParser::new(self.env.clone());
            for icon_theme_meta in icon_theme_metas {
                list.push([icon_theme_meta.id.clone(), icon_theme_meta.label.clone()]);
                parser.set_meta(icon_theme_meta);
                parser.parse()?;
                write::contrib(
                    "iconThemes",
                    &parser.meta.id,
                    &parser.icon_json,
                    ok!(self.env.build_dir.as_ref()),
                )
            }

            meta_json.icon_themes.replace(list);

            write::contrib_main(
                "iconThemes",
                Runtime::ICON_THEMES,
                ok!(self.env.build_dir.as_ref()),
            );
        }

        if self.main {
            let main = Main::new();
            write::main(&main.generate(b_code), ok!(self.env.build_dir.as_ref()));
            write::meta_json(meta_json, ok!(self.env.build_dir.as_ref()));
            write::plugin_json(plugin_json, ok!(self.env.build_dir.as_ref()));
            let _ = copy(
                join!(ok!(&self.env.src_dir.as_ref()), &package_json.icon),
                join!(ok!(self.env.build_dir.as_ref()), "dist", "icon.png"),
            );
            let _ = copy(
                join!(ok!(&self.env.src_dir.as_ref()), "README.md"),
                join!(ok!(self.env.build_dir.as_ref()), "dist", "README.md"),
            );

            let webpack = fun!(&self.webpack, &env);
            let result = Function::call(
                &webpack,
                WebPackConfig {
                    context: ok!(self.env.build_dir.clone()),
                    entry: own!("./src/main.js"),
                    output: WebPackOutput {
                        path: string!(join!(ok!(self.env.build_dir.as_ref()), "dist")),
                        clean: false,
                    },
                    mode: own!("production"),
                    cache: WebPackCache::default(),
                },
            )?;

            let rs_env = self.env.clone();
            let mut result = env.spawn_future(result)?;
            result.then(move |ctx| {
                if ctx.value {
                    return ctx.env.throw_error("webpack error", None);
                }

                let result = pack(&rs_env);
                if result.is_err() {
                    throw!(ok!(result.err()));
                }
                Ok(())
            })?;
        }

        Ok(())
    }

    fn create_contrib_dir(&self, contrib: &str, to: u8) {
        let _ = create_dir_all(join!(ok!(self.env.build_dir.as_ref()), "src", contrib));
        let dist = join!(ok!(self.env.build_dir.as_ref()), "dist", to.to_string());
        let _ = create_dir_all(dist);
    }

    fn create_build_dir(&mut self, name: String) {
        if self.env.build_dir.is_some() {
            return;
        } else {
            let path = join!(ok!(current_dir()), "build", name);
            if path.exists() {
                let _ = remove_dir_all(&path);
            }
            let _ = create_dir_all(&path);
            self.env.build_dir = Some(string!(path));
        }
    }
}
