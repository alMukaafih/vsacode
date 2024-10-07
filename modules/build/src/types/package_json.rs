use std::fmt;
use std::marker::PhantomData;
use std::path::PathBuf;
use std::str::FromStr;

use serde::{Deserialize, Deserializer};
use serde::de::{self, MapAccess, Visitor};
use void::Void;

#[derive(Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct IconThemeMeta {
    pub id: String,
    pub label: String,
    pub path: PathBuf,
}

#[derive(Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Contributes {
    pub icon_themes: Option<Vec<IconThemeMeta>>,
}

#[derive(Deserialize, Clone)]
pub struct Author {
    pub name: String,
    pub email: Option<String>,
    pub url: Option<String>,
}

impl FromStr for Author {
    type Err = Void;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let chars = s.chars();
        let mut n = true;
        let mut name = own!("");

        let mut e = false;
        let mut email: Option<String> = None;

        let mut u = false;
        let mut url: Option<String> = None;
        for ch in chars {
            if n {
                if ch == '<' {
                    n = false;
                    e = true;
                    email = Some(own!(""));
                    continue;
                } else if ch == '(' {
                    n = false;
                    u = true;
                    url = Some(own!(""));
                    continue;
                }
                name.push(ch);
                continue;
            }

            if e && ch != '>' {
                email.as_mut().unwrap().push(ch);
                continue;
            } else if ch == '>' {
                e = false;
                continue;
            }

            if u && ch != ')' {
                url.as_mut().unwrap().push(ch);
                continue;
            } else if ch == ')' {
                u = false;
                continue;
            }
        }
        name = own!(name.trim());

        Ok(Author { name, email, url })
    }
}

fn string_or_struct<'de, T, D>(deserializer: D) -> Result<T, D::Error>
where
    T: Deserialize<'de> + FromStr<Err = Void>,
    D: Deserializer<'de>,
{
    // This is a Visitor that forwards string types to T's `FromStr` impl and
    // forwards map types to T's `Deserialize` impl. The `PhantomData` is to
    // keep the compiler from complaining about T being an unused generic type
    // parameter. We need T in order to know the Value type for the Visitor
    // impl.
    struct StringOrStruct<T>(PhantomData<fn() -> T>);

    impl<'de, T> Visitor<'de> for StringOrStruct<T>
    where
        T: Deserialize<'de> + FromStr<Err = Void>,
    {
        type Value = T;

        fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
            formatter.write_str("string or map")
        }

        fn visit_str<E>(self, value: &str) -> Result<T, E>
        where
            E: de::Error,
        {
            Ok(FromStr::from_str(value).unwrap())
        }

        fn visit_map<M>(self, map: M) -> Result<T, M::Error>
        where
            M: MapAccess<'de>,
        {
            // `MapAccessDeserializer` is a wrapper that turns a `MapAccess`
            // into a `Deserializer`, allowing it to be used as the input to T's
            // `Deserialize` implementation. T then deserializes itself using
            // the entries from the map visitor.
            Deserialize::deserialize(de::value::MapAccessDeserializer::new(map))
        }
    }

    deserializer.deserialize_any(StringOrStruct(PhantomData))
}

#[derive(Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PackageJson {
    pub name: String,
    pub display_name: String,
    pub description: String,
    pub version: String,
    pub publisher: String,
    #[serde(deserialize_with = "string_or_struct")]
    pub author: Author,
    pub contributes: Contributes,
    pub icon: PathBuf,
}
