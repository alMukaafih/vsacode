use napi_derive::napi;

#[napi(object)]
#[derive(Clone)]
pub struct Attribute {
    pub fill: String,
}

#[napi(object)]
#[derive(Clone)]
pub struct Params {
    #[napi(ts_type = "string")]
    pub attrs: String,
    pub attributes: Option<Vec<Attribute>>,
}

#[napi(object)]
#[derive(Clone)]
pub struct Plugin {
    #[napi(ts_type = "\"removeAttrs\"")]
    pub name: String,
    pub params: Params,
}

#[napi(object)]
#[derive(Clone)]
pub struct SvgoConfig {
    pub plugins: Vec<Plugin>,
}

impl Default for SvgoConfig {
    fn default() -> Self {
        let config = Self {
            plugins: vec![
                Plugin {
                    name: own!("removeAttrs"),
                    params: Params {
                        attrs: own!("fill"),
                        attributes: None,
                    },
                },
                Plugin {
                    name: own!("addAttributesToSVGElement"),
                    params: Params {
                        attrs: Default::default(),
                        attributes: Some(vec![Attribute {
                            fill: own!("currentColor"),
                        }]),
                    },
                },
            ],
        };

        config
    }
}
