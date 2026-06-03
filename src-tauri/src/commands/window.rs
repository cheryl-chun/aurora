use tauri::{AppHandle, Manager};

use crate::models::error::{AppError, AppErrorCode, AppResult};

#[tauri::command]
pub fn hide_main_window(app: AppHandle) -> AppResult<()> {
    if let Some(window) = app.get_webview_window("main") {
        window.hide().map_err(|error| {
            AppError::with_details(
                AppErrorCode::WindowOperationFailed,
                "隐藏主窗口失败",
                error.to_string(),
            )
        })?;
    }

    Ok(())
}
