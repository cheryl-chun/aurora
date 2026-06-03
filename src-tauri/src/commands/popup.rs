use serde::{Deserialize, Serialize};
use std::sync::RwLock;
use tauri::{AppHandle, Emitter, State};

use crate::{
    models::error::{AppError, AppErrorCode, AppResult},
    translator::types::TokenUsage,
};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PopupPayload {
    pub status: String,
    pub source_text: Option<String>,
    pub translated_text: Option<String>,
    pub usage: Option<TokenUsage>,
    pub error: Option<String>,
    pub mode: Option<String>, // "replace" | "append"
}

pub struct PopupState {
    payload: RwLock<Option<PopupPayload>>,
}

impl PopupState {
    pub fn new() -> Self {
        Self {
            payload: RwLock::new(None),
        }
    }

    pub fn set(&self, payload: PopupPayload) -> AppResult<()> {
        let mut guard = self.payload.write().map_err(|error| {
            AppError::with_details(
                AppErrorCode::PopupStateFailed,
                "写入弹窗状态失败",
                error.to_string(),
            )
        })?;

        *guard = Some(payload);

        Ok(())
    }

    pub fn get(&self) -> AppResult<Option<PopupPayload>> {
        let guard = self.payload.read().map_err(|error| {
            AppError::with_details(
                AppErrorCode::PopupStateFailed,
                "读取弹窗状态失败",
                error.to_string(),
            )
        })?;

        Ok(guard.clone())
    }

    fn clear(&self) -> AppResult<()> {
        let mut guard = self.payload.write().map_err(|error| {
            AppError::with_details(
                AppErrorCode::PopupStateFailed,
                "清理弹窗状态失败",
                error.to_string(),
            )
        })?;

        *guard = None;

        Ok(())
    }
}

pub fn publish_popup_payload(
    app: AppHandle,
    state: State<'_, PopupState>,
    payload: PopupPayload,
) -> AppResult<()> {
    state.set(payload.clone())?;

    app.emit_to("translate-popup", "aurora://popup-payload", payload)
        .map_err(|error| {
            AppError::with_details(
                AppErrorCode::PopupStateFailed,
                "发送弹窗状态失败",
                error.to_string(),
            )
        })?;

    Ok(())
}

#[tauri::command]
pub fn get_popup_payload(state: State<'_, PopupState>) -> AppResult<Option<PopupPayload>> {
    state.get()
}

#[tauri::command]
pub fn clear_popup_payload(app: AppHandle, state: State<'_, PopupState>) -> AppResult<()> {
    state.clear()?;

    app.emit_to("translate-popup", "aurora://popup-payload-cleared", ())
        .ok();

    Ok(())
}
