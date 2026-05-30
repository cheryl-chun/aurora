use async_trait::async_trait;

#[derive(Debug, Clone)]
pub struct TranslatorRequest {
    pub text: String,
    pub source_language: Option<String>,
    pub target_language: Option<String>,
}

#[async_trait]
pub trait Translator: Send + Sync {
    async fn translate(&self, request: TranslatorRequest) -> anyhow::Result<String>;
}
