use std::collections::HashMap;

use crate::types::icon_theme::Mapping;

const VS_ACE_MAP: &str = include_str!("../../../../runtimes/vs-ace.json");

pub fn vs_to_ace(map: &mut Mapping) {
    if map.is_none() {
        return;
    }

    let vs_ace: HashMap<String, String> = ok!(serde_json::from_str(VS_ACE_MAP));

    for (vs, v) in ok!(map.clone()) {
        if let Some(ace) = vs_ace.get(&vs) {
            ok!(map.as_mut()).remove(&vs);
            ok!(map.as_mut()).insert(ace.clone(), v);
        }
    }
}
