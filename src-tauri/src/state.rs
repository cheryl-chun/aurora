use std::sync::RwLock;

use crate::models::provider::ApiProvider;
use anyhow::Result;

pub struct AppState {
    providers: RwLock<Vec<ApiProvider>>,
}

impl AppState {
    pub fn new(providers: Vec<ApiProvider>) -> Self {
        Self {
            providers: RwLock::new(sort_providers(providers)),
        }
    }

    pub fn providers(&self) -> Result<Vec<ApiProvider>> {
        let providers = self
            .providers
            .read()
            .map_err(|e| anyhow::anyhow!("读取 API 配置状态失败: {}", e))?;

        Ok(providers.clone())
    }

    pub fn replace_providers(&self, providers: Vec<ApiProvider>) -> Result<()> {
        let mut providers_guard = self
            .providers
            .write()
            .map_err(|e| anyhow::anyhow!("写入 API 配置状态失败: {}", e))?;

        *providers_guard = sort_providers(providers);

        Ok(())
    }
}

fn sort_providers(mut providers: Vec<ApiProvider>) -> Vec<ApiProvider> {
    providers.sort_by_key(|p| p.priority);
    providers
}
