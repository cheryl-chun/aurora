use serde::{Deserialize, Serialize};
use std::sync::RwLock;
use tauri::{AppHandle, Emitter, State};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PopupPayload {
    pub status: String,
    pub source_text: Option<String>,
    pub translated_text: Option<String>,
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

    pub fn set(&self, payload: PopupPayload) -> Result<(), String> {
        let mut guard = self
            .payload
            .write()
            .map_err(|_| "写入弹窗状态失败".to_string())?;

        *guard = Some(payload);

        Ok(())
    }

    pub fn get(&self) -> Result<Option<PopupPayload>, String> {
        let guard = self
            .payload
            .read()
            .map_err(|_| "读取弹窗状态失败".to_string())?;

        Ok(guard.clone())
    }

    fn clear(&self) -> Result<(), String> {
        let mut guard = self
            .payload
            .write()
            .map_err(|_| "清理弹窗状态失败".to_string())?;

        *guard = None;

        Ok(())
    }
}

pub fn publish_popup_payload(
    app: AppHandle,
    state: State<'_, PopupState>,
    payload: PopupPayload,
) -> Result<(), String> {
    state.set(payload.clone())?;

    app.emit_to("translate-popup", "aurora://popup-payload", payload)
        .map_err(|error| error.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn get_popup_payload(state: State<'_, PopupState>) -> Result<Option<PopupPayload>, String> {
    state.get()
}

#[tauri::command]
pub fn clear_popup_payload(app: AppHandle, state: State<'_, PopupState>) -> Result<(), String> {
    state.clear()?;

    app.emit_to("translate-popup", "aurora://popup-payload-cleared", ())
        .ok();

    Ok(())
}
