use std::path::PathBuf;

use serde::Serialize;

use super::package_json::PackageJson;

#[derive(Clone, Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Author {
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub email: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub github: Option<String>,
}

/// Plugin.json is a manifest file that contains information about the plugin,
/// such as name, description, author, etc. It is required for every plugin.
#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PluginJson {
    /// ID of the plugin, reverse domain name format
    pub id: String,
    /// Name of the plugin
    pub name: String,
    /// Path to the main.js file
    pub main: String,
    /// Version of the plugin
    pub version: String,
    /// Path to the readme.md file
    pub readme: PathBuf,
    /// Path to the icon.png file
    pub icon: PathBuf,
    /// List of files to be included in the plugin zip file
    pub files: Vec<String>,
    /// Price of the plugin in INR (min. 10 and max. 10000), if 0 or omitted, plugin is free, this can be changed later.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub price: Option<i32>,
    /// Minimum acode version code required to run the plugin
    pub min_version_code: i32,
    /// Author
    pub author: Author,
}

impl From<PackageJson> for PluginJson {
    fn from(p: PackageJson) -> Self {
        Self {
            id: p.name, //format!("{}.{}",p.publisher, p.name),
            name: p.display_name,
            main: own!("main.js"),
            version: p.version,
            readme: join!("README.md"),
            icon: join!("icon.png"),
            files: Default::default(),
            price: None,
            min_version_code: 292,
            author: Author {
                name: p.author.name,
                email: p.author.email,
                url: p.author.url,
                github: None,
            },
        }
    }
}
