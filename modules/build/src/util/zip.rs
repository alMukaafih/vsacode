use std::env::current_dir;
use std::fs::{self, File};
use std::io::{self, Read, Write};
use std::path::{Path, PathBuf};

use walkdir::WalkDir;
use zip::write::SimpleFileOptions;

use crate::types::env::RsEnv;

pub fn extract(env: &RsEnv) -> io::Result<()> {
    let fname = &env.src_info.as_ref().unwrap().path;
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

pub fn pack(env: &RsEnv) -> io::Result<()> {
    let src_dir = join!(ok!(env.build_dir.as_ref()), "dist");
    let dst_file = format!("{}.zip", ok!(env.plugin_id.as_ref()));
    let dst_file = join!(current_dir()?, dst_file);
    let file = File::create(dst_file)?;

    let walkdir = WalkDir::new(&src_dir);
    let dir_entries = walkdir.into_iter();
    let dir_entries = dir_entries.filter_map(|e| e.ok());

    let mut zip = zip::ZipWriter::new(file);
    let options = SimpleFileOptions::default().compression_method(zip::CompressionMethod::Deflated);

    let prefix = Path::new(&src_dir);
    let mut buffer = Vec::new();

    for entry in dir_entries {
        let path = entry.path();
        let name = ok!(path.strip_prefix(prefix));
        let path_as_string = string!(name);

        // Write file or directory explicitly
        // Some unzip tools unzip files with directory paths correctly, some do not!
        if path.is_file() {
            zip.start_file(path_as_string, options)?;
            let mut f = File::open(path)?;

            f.read_to_end(&mut buffer)?;
            zip.write_all(&buffer)?;
            buffer.clear();
        } else if !name.as_os_str().is_empty() {
            // Only if not root! Avoids path spec / warning
            // and mapname conversion failed error on unzip
            zip.add_directory(path_as_string, options)?;
        }
    }

    zip.finish()?;
    Ok(())
}
