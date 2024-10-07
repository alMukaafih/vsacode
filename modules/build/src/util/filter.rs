use crate::types::icon_theme::Defs;

pub fn filter(defs: &mut Defs) {
    for (k, v) in defs.clone() {
        if !v.is_bundled {
            defs.remove(&k);
        }
    }
}
