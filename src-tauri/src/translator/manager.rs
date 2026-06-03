use std::time::Duration;

use crate::{
    models::{
        error::{AppError, AppErrorCode, AppResult},
        provider::ApiProvider,
    },
    translator::{
        factory::TranslatorFactory,
        types::{TranslatorRequest, TranslatorResponse},
    },
};

pub struct TranslatorManager {
    client: reqwest::Client,
}

impl TranslatorManager {
    pub fn new() -> Self {
        let client = reqwest::Client::builder()
            .timeout(Duration::from_secs(30))
            .connect_timeout(Duration::from_secs(10))
            .build()
            .expect("failed to build reqwest client");

        Self { client }
    }

    pub async fn translate(
        &self,
        providers: Vec<ApiProvider>,
        request: TranslatorRequest,
    ) -> AppResult<TranslatorResponse> {
        let enabled_providers = providers
            .into_iter()
            .filter(|p| p.enabled)
            .collect::<Vec<_>>();

        if enabled_providers.is_empty() {
            return Err(AppError::new(
                AppErrorCode::NoEnabledProvider,
                "没有启用的 API 配置",
            ));
        }

        let mut errors = Vec::new();

        for provider in enabled_providers {
            let name = provider.name.clone();

            let translator = match TranslatorFactory::create(provider, self.client.clone()) {
                Ok(translator) => translator,
                Err(error) => {
                    errors.push(format!("{}: {}", name, error.message()));
                    continue;
                }
            };

            match translator.translate(request.clone()).await {
                Ok(result) => return Ok(result),
                Err(error) => {
                    errors.push(format!("{}: {}", name, error.message()));
                }
            }
        }

        Err(AppError::with_details(
            AppErrorCode::ProviderRequestFailed,
            "所有翻译器都失败",
            errors.join("\n"),
        ))
    }
}
