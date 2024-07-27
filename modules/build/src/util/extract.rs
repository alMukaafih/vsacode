use std::fs;
use std::io;
use std::path::PathBuf;

use crate::types::env::JsEnv;

pub fn extract(env: &JsEnv) -> io::Result<()> {
    let fname = env.vsix_path.clone();
    let tmp_dir = PathBuf::from(env.tmp_dir.clone());
    let file = fs::File::open(fname)?;

    let mut archive = zip::ZipArchive::new(file)?;

    for i in 0..archive.len() {
        let mut outpath = tmp_dir.clone();
        let mut file = archive.by_index(i)?;
        let out = match file.enclosed_name() {
            Some(path) => path,
            None => continue,
        };
        outpath.push(out);

        if file.is_dir() {
            fs::create_dir_all(&outpath)?;
        } else {
            if let Some(p) = outpath.parent() {
                if !p.exists() {
                    fs::create_dir_all(p)?;
                }
            }
            let mut outfile = fs::File::create(&outpath)?;
            io::copy(&mut file, &mut outfile)?;
        }

        // Get and Set permissions
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;

            if let Some(mode) = file.unix_mode() {
                fs::set_permissions(&outpath, fs::Permissions::from_mode(mode))?;
            }
        }
    }
    Ok(())
}