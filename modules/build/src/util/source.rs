use std::{env::current_dir, path::PathBuf};

use napi::Error;

use crate::types::env::{Arg, ArgType};

#[derive(Clone, Debug)]
pub enum SrcType {
    Vsix, Dir
}

#[derive(Clone, Debug)]
pub struct SrcInfo {
    pub(crate) path: PathBuf,
    pub(crate) r#type: SrcType,
}

pub fn get_src_info(args: &Vec<Arg>) -> napi::Result<SrcInfo> {
    let mut path = current_dir().unwrap();
    for arg in args {
        if arg.r#type == ArgType::Flag {
            continue;
        }
        path.push(path!(arg.key.clone()));
        break;
    }

    if path.as_os_str().is_empty() {
        return Err(Error::new(napi::Status::InvalidArg, "<u>path</u> is required"));
    }

    let r#type = if path.is_dir() {
        SrcType::Dir
    } else if path.is_file() {
        SrcType::Vsix
    } else {
        return Err(Error::new(napi::Status::InvalidArg, "invalid <u>path</u>"));
    };

    Ok(SrcInfo { path, r#type })
}