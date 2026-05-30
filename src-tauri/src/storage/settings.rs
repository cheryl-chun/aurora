use std::{fs, path::PathBuf};

use anyhow::{Context, Result};
use tauri::{AppHandle, Manager};

use crate::models::settings::AppSettings;

fn settings_file_path(app: &AppHandle) -> Result<PathBuf> {
    let config_dir = app
        .path()
        .app_config_dir()
        .context("获取应用配置目录失败")?;

    fs::create_dir_all(&config_dir)
        .with_context(|| format!("创建配置目录失败: {}", config_dir.display()))?;

    Ok(config_dir.join("settings.json"))
}

pub fn load(app: &AppHandle) -> Result<AppSettings> {
    let path = settings_file_path(app)?;

    if !path.exists() {
        return Ok(AppSettings::default());
    }

    let content = fs::read_to_string(&path)
        .with_context(|| format!("读取设置文件失败: {}", path.display()))?;

    Ok(serde_json::from_str::<AppSettings>(&content)
        .with_context(|| format!("解析设置文件失败: {}", path.display()))?)
}

pub fn save(app: &AppHandle, settings: AppSettings) -> Result<()> {
    let path = settings_file_path(app)?;
    let content = serde_json::to_string_pretty(&settings).context("序列化设置失败")?;
    fs::write(&path, content).with_context(|| format!("写入设置文件失败: {}", path.display()))?;
    Ok(())
}
