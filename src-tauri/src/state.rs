use std::sync::RwLock;

use crate::models::{
    error::{AppError, AppErrorCode, AppResult},
    provider::ApiProvider,
};

pub struct AppState {
    providers: RwLock<Vec<ApiProvider>>,
}

impl AppState {
    pub fn new(providers: Vec<ApiProvider>) -> Self {
        Self {
            providers: RwLock::new(sort_providers(providers)),
        }
    }

    pub fn providers(&self) -> AppResult<Vec<ApiProvider>> {
        let providers = self.providers.read().map_err(|error| {
            AppError::with_details(
                AppErrorCode::StateReadFailed,
                "读取 API 配置状态失败",
                error.to_string(),
            )
        })?;

        Ok(providers.clone())
    }

    pub fn replace_providers(&self, providers: Vec<ApiProvider>) -> AppResult<()> {
        let mut providers_guard = self.providers.write().map_err(|error| {
            AppError::with_details(
                AppErrorCode::StateWriteFailed,
                "写入 API 配置状态失败",
                error.to_string(),
            )
        })?;

        *providers_guard = sort_providers(providers);

        Ok(())
    }
}

fn sort_providers(mut providers: Vec<ApiProvider>) -> Vec<ApiProvider> {
    providers.sort_by_key(|p| p.priority);
    providers
}
