use std::path::PathBuf;

use serde::Deserialize;

#[derive(Debug, Deserialize, PartialEq)]
#[serde(rename_all = "PascalCase")]
pub struct Asset {
    r#type: String,
    path: PathBuf,
    addressable: bool,
}

#[derive(Debug, Deserialize, PartialEq)]
pub struct Assets {
    #[serde(rename = "$value")]
    value: Vec<Asset>
}

#[derive(Debug, Deserialize, PartialEq)]
#[serde(rename_all = "PascalCase")]
pub struct InstallationTarget {
    id: String,
}

#[derive(Debug, Deserialize, PartialEq)]
#[serde(rename_all = "PascalCase")]
pub struct Installation {
    installation_target: InstallationTarget,
}

#[derive(Debug, Deserialize, PartialEq)]
pub struct Dependencies {}

#[derive(Debug, Deserialize, PartialEq)]
#[serde(rename_all = "PascalCase")]
pub struct Property {
    id: String,
    value: String,
}

#[derive(Debug, Deserialize, PartialEq)]
pub struct Properties {
    #[serde(rename = "$value")]
    value: Vec<Property>
}

#[derive(Debug, Deserialize, PartialEq)]
#[serde(rename_all = "PascalCase")]
pub struct Identity {
    language: String,
    id: String,
    version: String,
    publisher: String,
    properties: Properties,
    license: PathBuf,
    icon: PathBuf,
}

#[derive(Debug, Deserialize, PartialEq)]
#[serde(rename_all = "PascalCase")]
pub struct Metadata {
    identity: Identity,
    display_name: String,
    description: String,
}

#[derive(Debug, Deserialize, PartialEq)]
#[serde(rename_all = "PascalCase")]
pub struct PackageManifest {
    metadata: Metadata,
    installation: Installation,
    assets: Assets,
}