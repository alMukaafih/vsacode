use napi_derive::napi;

#[napi(object)]
#[derive(Clone)]
pub struct WebPackOutput {
    /// The output directory as an absolute path.
    pub path: String,
    /// Clean the output directory before emit.
    pub clean: bool,
}

#[napi(object)]
#[derive(Clone)]
pub struct WebPackCache {
    /// Base directory for the cache. Defaults to node_modules/.cache/webpack.
    pub cache_directory: Option<String>,
    /// Compression type used for the cache files. By default it is false.
    #[napi(ts_type = "\"gzip\"")]
    pub compression: String,
    /// cache.store tells webpack when to store data on the file system.
    /// - 'pack': Store data when compiler is idle in a single file for all cached items
    #[napi(ts_type = "\"pack\"")]
    pub store: String,
    /// Sets the cache type to either in memory or on the file system.
    #[napi(ts_type = "\"filesystem\"")]
    pub r#type: String,
    /// Version of the cache data.
    /// Different versions won't allow to reuse the cache and override existing content.
    /// Update the version when configuration changed in a way which doesn't allow to reuse cache.
    /// This will invalidate the cache.
    pub version: String,
}

impl Default for WebPackCache {
    fn default() -> Self {
        Self {
            r#type: own!("filesystem"),
            store: own!("pack"),
            version: own!("0.6.0"),
            cache_directory: None,
            compression: own!("gzip"),
        }
    }
}

#[napi(object)]
#[derive(Clone)]
pub struct WebPackConfig {
    /// The base directory, an absolute path, for resolving entry points and loaders from the configuration.
    /// By default, the current working directory of Node.js is used, but it's recommended to pass a value in your configuration.
    /// This makes your configuration independent from CWD (current working directory).
    pub context: String,
    /// An entry point indicates which module webpack should use to begin building out its internal dependency graph.
    /// Webpack will figure out which other modules and libraries that entry point depends on (directly and indirectly).
    pub entry: String,
    /// The output property tells webpack where to emit the bundles it creates and how to name these files.
    pub output: WebPackOutput,
    /// By setting the mode parameter to either development,
    /// production or none, you can enable webpack's built-in optimizations that correspond to each environment.
    /// The default value is production.
    #[napi(ts_type = "\"production\" | \"development\"")]
    pub mode: String,
    /// Cache the generated webpack modules and chunks to improve build speed.
    pub cache: WebPackCache,
}
