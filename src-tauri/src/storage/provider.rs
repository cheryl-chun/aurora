use std::{fs, path::PathBuf};

use anyhow::{Context, Result};
use tauri::{AppHandle, Manager};

use crate::models::provider::ApiProvider;

fn provider_file_path(app: &AppHandle) -> Result<PathBuf> {
    let config_dir = app
        .path()
        .app_config_dir()
        .context("获取应用配置目录失败")?;

    fs::create_dir_all(&config_dir)
        .with_context(|| format!("创建配置目录失败: {}", config_dir.display()))?;

    Ok(config_dir.join("providers.json"))
}

pub fn load(app: &AppHandle) -> Result<Vec<ApiProvider>> {
    let path = provider_file_path(app)?;

    if !path.exists() {
        return Ok(Vec::new());
    }

    let context = fs::read_to_string(&path)
        .with_context(|| format!("读取 API 配置文件失败: {}", path.display()))?;

    let providers = serde_json::from_str::<Vec<ApiProvider>>(&context)
        .with_context(|| format!("解析 API 配置文件失败: {}", path.display()))?;

    Ok(providers)
}

pub fn save(app: &AppHandle, providers: Vec<ApiProvider>) -> Result<()> {
    let path = provider_file_path(app)?;

    let content = serde_json::to_string_pretty(&providers).context("序列化 API 配置失败")?;

    fs::write(&path, content)
        .with_context(|| format!("写入 API 配置文件失败: {}", path.display()))?;

    Ok(())
}
