pub mod icon_theme;

use napi::Result;

pub trait Parser {
    fn parse(&mut self) -> Result<()>;
}