use tauri::AppHandle;

use crate::{models::settings::AppSettings, storage::settings};

#[tauri::command]
pub fn load_app_settings(app: AppHandle) -> Result<AppSettings, String> {
    settings::load(&app).map_err(|error| format!("{:#}", error))
}

#[tauri::command]
pub fn save_app_settings(app: AppHandle, app_settings: AppSettings) -> Result<(), String> {
    settings::save(&app, app_settings).map_err(|error| format!("{:#}", error))
}
