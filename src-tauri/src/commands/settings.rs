use tauri::AppHandle;

use crate::{
    models::{
        error::{AppError, AppErrorCode, AppResult},
        settings::AppSettings,
    },
    storage::settings,
};

#[tauri::command]
pub fn load_app_settings(app: AppHandle) -> AppResult<AppSettings> {
    settings::load(&app)
        .map_err(|error| AppError::from_anyhow(AppErrorCode::ConfigReadFailed, error))
}

#[tauri::command]
pub fn save_app_settings(app: AppHandle, app_settings: AppSettings) -> AppResult<()> {
    settings::save(&app, app_settings)
        .map_err(|error| AppError::from_anyhow(AppErrorCode::ConfigWriteFailed, error))
}
