use std::fmt::Display;

use crate::types::icon_theme::FontProperties;

pub type FontRule = FontProperties;

impl Display for FontRule {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let mut srcs = vec![];
        for src in &self.src {
            srcs.push(format!(
                "url({})format('{}')",
                src.path,
                src.format
            ));
        }

        f.write_str("@font-face{")?;
        // f.write_str("font-display:block;")?;
        f.write_fmt(format_args!("font-family:'{}';", self.id))?;
        f.write_fmt(format_args!("src:{};", srcs.join(",")))?;

        if self.size.is_some() {
            f.write_fmt(format_args!("font-size:{};", ok!(self.size.as_ref())))?;
        }

        if self.style.is_some() {
            f.write_fmt(format_args!("font-style:{};", ok!(self.style.as_ref())))?;
        }

        if self.weight.is_some() {
            f.write_fmt(format_args!("font-weight:{};", ok!(self.weight.as_ref())))?;
        }

        f.write_str("}")?;
        Ok(())
    }
}