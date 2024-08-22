use std::str;

pub struct Main {
    src: Lines,
}

impl Main {
    pub fn new() -> Self {
        let main = include_str!("../../../../runtimes/dist/main.js");
        let mut src = Lines::new();
        let mut icon_theme = false;
        let mut pro_theme = false;
        let mut theme = false;
        let _lines: Vec<_> = main
            .lines()
            .map(|x| {
                if icon_theme {
                    src.push(x.to_owned(), Attribute::IconTheme);
                    icon_theme = false;
                } else if pro_theme {
                    src.push(x.to_owned(), Attribute::ProTheme);
                    pro_theme = false;
                } else if theme {
                    src.push(x.to_owned(), Attribute::Theme);
                    theme = false;
                } else if Self::check_match(x, "/ @vsa-icontheme") {
                    icon_theme = true;
                } else if Self::check_match(x, "/ @vsa-protheme") {
                    pro_theme = true;
                } else if Self::check_match(x, "/ @vsa-theme") {
                    theme = true;
                } else {
                    src.push(x.to_owned(), Attribute::Text);
                }
                x
            })
            .collect();

        //assert_eq!(lines.len(), src.content.len());

        Self { src }
    }

    pub fn check_match(word: &str, expected: &str) -> bool {
        let src: &[u8] = word.as_bytes();
        for i in 0..src.len() - 1 {
            match src[i] as char {
                ' ' | '\r' | '\t' => {
                    continue;
                }
                '/' => {
                    let start = i + 1;

                    let length = expected.len();
                    if length > src.len() - start {
                        return false;
                    }
                    let sl = &src[start..(start + length)];
                    let s = unsafe { str::from_utf8_unchecked(sl) };
                    if s != expected {
                        return false;
                    }
                    return true;
                }
                _ => {
                    return false;
                }
            }
        }
        false
    }

    /// meta[0] -> iconTheme
    /// meta[1] -> productIconTheme
    /// meta[2] -> theme
    pub fn generate(&self, b_code: &[bool]) -> String {
        let mut generated = String::new();
        for (c, a) in self.src.content.iter().zip(self.src.attribute.iter()) {
            match a {
                Attribute::IconTheme => {
                    if b_code[0] {
                        generated.push_str(&c);
                        generated.push('\n');
                    }
                }
                Attribute::ProTheme => {
                    if b_code[1] {
                        generated.push_str(&c);
                        generated.push('\n');
                    }
                }
                Attribute::Theme => {
                    if b_code[2] {
                        generated.push_str(&c);
                        generated.push('\n');
                    }
                }
                Attribute::Text => {
                    generated.push_str(&c);
                    generated.push('\n');
                }
            }
        }
        generated
    }
}

#[derive(Debug)]
struct Lines {
    content: Vec<String>,
    attribute: Vec<Attribute>,
}

impl Lines {
    pub fn new() -> Self {
        Self {
            content: vec![],
            attribute: vec![],
        }
    }

    pub fn push(&mut self, content: String, attribute: Attribute) {
        self.content.push(content);
        self.attribute.push(attribute);
    }
}

#[derive(Debug)]
enum Attribute {
    IconTheme,
    ProTheme,
    Theme,
    Text,
}

pub struct Runtime;

impl Runtime {
    pub const ICON_THEMES: &'static str = include_str!("../../../../runtimes/dist/iconThemes.js");
}
