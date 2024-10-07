pub use style_rule::*;
pub use style_sheet::*;

mod font_rule;
mod style_rule;
mod style_sheet;

pub enum FolderType {
    Normal,
    Expanded,
    Root,
    RootExpanded,
}