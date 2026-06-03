use async_trait::async_trait;
use serde::{Deserialize, Serialize};

use crate::models::error::AppResult;

#[derive(Debug, Clone)]
pub struct TranslatorRequest {
    pub text: String,
    pub source_language: Option<String>,
    pub target_language: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TranslatorResponse {
    pub content: String,
    pub usage: Option<TokenUsage>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TokenUsage {
    pub prompt_tokens: Option<u32>,
    pub completion_tokens: Option<u32>,
    pub total_tokens: Option<u32>,
}

#[async_trait]
pub trait Translator: Send + Sync {
    async fn translate(&self, request: TranslatorRequest) -> AppResult<TranslatorResponse>;
}
