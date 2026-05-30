use crate::{
    models::provider::{ApiProvider, ProviderType},
    translator::{llm::LlmTranslator, types::Translator},
};
use anyhow::{bail, Result};

pub struct TranslatorFactory;

impl TranslatorFactory {
    pub fn create(provider: ApiProvider, client: reqwest::Client) -> Result<Box<dyn Translator>> {
        match provider.provider_type {
            ProviderType::Llm => Ok(Box::new(LlmTranslator::new(provider, client))),
            ProviderType::Translator => bail!("暂不支持"),
        }
    }
}
