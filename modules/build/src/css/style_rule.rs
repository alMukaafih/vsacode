use std::fmt::{Display, Write};

pub struct StyleRule {
    pub selectors: Vec<String>,
    pub content: String,
    pub display: bool,
    pub url: Option<String>,
    pub color: Option<String>,
    pub font_family: Option<String>,
    pub font_size: Option<String>,
}

impl StyleRule {
    pub fn new(
        selector: String,
        content: Option<String>,
        url: Option<String>,
        color: Option<String>,
        font_family: Option<String>,
        font_size: Option<String>,
    ) -> Self {
        let content = if content.is_some() {
            ok!(content)
        } else {
            own!("")
        };
        let display = if url.is_some() { true } else { false };

        Self {
            selectors: vec![selector],
            content,
            display,
            url,
            color,
            font_family,
            font_size,
        }
    }
}

impl Display for StyleRule {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(&self.selectors.join(","))?;
        f.write_char('{')?;
        f.write_fmt(format_args!("content:'{}'!important;", self.content))?;

        if self.display {
            f.write_str("display:inline-block;")?;
            f.write_str("background-size:contain;")?;
            f.write_str("background-repeat:no-repeat;")?;
            f.write_str("height:1em;")?;
            f.write_str("width:1em;")?;
        }

        if self.url.is_some() {
            f.write_fmt(format_args!(
                "background-image:url({});",
                self.url.as_ref().unwrap()
            ))?;
        }

        if self.color.is_some() {
            f.write_fmt(format_args!("color:{};", self.color.as_ref().unwrap()))?;
        }

        if self.font_family.is_some() {
            f.write_fmt(format_args!(
                "font-family:{};",
                self.font_family.as_ref().unwrap()
            ))?;
        }

        if self.font_size.is_some() {
            f.write_fmt(format_args!(
                "font-size:{};",
                self.font_size.as_ref().unwrap()
            ))?;
        }

        f.write_char('}')?;
        Ok(())
    }
}
