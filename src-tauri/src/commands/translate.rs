use tauri::State;

use crate::{
    models::error::{AppError, AppErrorCode, AppResult},
    state::AppState,
    translator::{
        manager::TranslatorManager,
        types::{TranslatorRequest, TranslatorResponse},
    },
};

#[tauri::command]
pub async fn translate_text(
    app_state: State<'_, AppState>,
    translator_manager: State<'_, TranslatorManager>,
    text: String,
    source_language: Option<String>,
    target_language: Option<String>,
) -> AppResult<TranslatorResponse> {
    println!("[translate] command received, text length={}", text.len());

    translate_text_inner(
        app_state,
        translator_manager,
        text,
        source_language,
        target_language,
    )
    .await
}

async fn translate_text_inner(
    app_state: State<'_, AppState>,
    translator_manager: State<'_, TranslatorManager>,
    text: String,
    source_language: Option<String>,
    target_language: Option<String>,
) -> AppResult<TranslatorResponse> {
    let text = text.trim().to_string();

    if text.is_empty() {
        return Err(AppError::new(
            AppErrorCode::InvalidInput,
            "请输入要翻译的文本",
        ));
    }

    let providers = app_state.providers()?;

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
