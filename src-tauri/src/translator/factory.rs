use crate::{
    models::{
        error::{AppError, AppErrorCode, AppResult},
        provider::{ApiProvider, ProviderType},
    },
    translator::{llm::LlmTranslator, types::Translator},
};

pub struct TranslatorFactory;

impl TranslatorFactory {
    pub fn create(
        provider: ApiProvider,
        client: reqwest::Client,
    ) -> AppResult<Box<dyn Translator>> {
        match provider.provider_type {
            ProviderType::Llm => Ok(Box::new(LlmTranslator::new(provider, client))),
            ProviderType::Translator => Err(AppError::new(
                AppErrorCode::ProviderUnsupported,
                "暂不支持该翻译器类型",
            )),
        }
    }
}
