use tauri::State;

use crate::{
    state::AppState,
    translator::{manager::TranslatorManager, types::TranslatorRequest},
};
use anyhow::{bail, Result};

#[tauri::command]
pub async fn translate_text(
    app_state: State<'_, AppState>,
    translator_manager: State<'_, TranslatorManager>,
    text: String,
    source_language: Option<String>,
    target_language: Option<String>,
) -> Result<String, String> {
    println!("[translate] command received, text length={}", text.len());

    translate_text_inner(
        app_state,
        translator_manager,
        text,
        source_language,
        target_language,
    )
    .await
    .map_err(|error| format!("{:#}", error))
}

async fn translate_text_inner(
    app_state: State<'_, AppState>,
    translator_manager: State<'_, TranslatorManager>,
    text: String,
    source_language: Option<String>,
    target_language: Option<String>,
) -> Result<String> {
    let text = text.trim().to_string();

    if text.is_empty() {
        bail!("请输入要翻译的文本")
    }

    let providers = app_state.providers().map_err(anyhow::Error::msg)?;

    translator_manager
        .translate(
            providers,
            TranslatorRequest {
                text,
                source_language,
                target_language,
            },
        )
        .await
}
