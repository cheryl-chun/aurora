use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "snake_case")]
pub enum ProviderType {
    Llm,
    Translator,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ApiProvider {
    pub id: String,
    pub name: String,
    pub provider_type: ProviderType,
    pub base_url: String,
    pub api_key: String,
    pub model: Option<String>,
    pub prompt_template: Option<String>,
    pub enabled: bool,
    pub priority: i32,
}
