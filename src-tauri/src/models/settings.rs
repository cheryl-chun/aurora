use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub selection_shortcut: String,
    #[serde(default = "default_append_selection_shortcut")]
    pub append_selection_shortcut: String,
    pub source_language: String,
    pub target_language: String,
    pub show_source_text: bool,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            selection_shortcut: "CommandOrControl+Shift+E".to_string(),
            append_selection_shortcut: default_append_selection_shortcut(),
            source_language: "auto".to_string(),
            target_language: "zh-CN".to_string(),
            show_source_text: false,
        }
    }
}

fn default_append_selection_shortcut() -> String {
    "CommandOrControl+Shift+A".to_string()
}
