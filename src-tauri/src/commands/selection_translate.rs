use tauri::{AppHandle, Manager, State};

use crate::{
    commands::{
        popup::{publish_popup_payload, PopupPayload, PopupState},
        selection::capture_selected_text_inner,
    },
    models::error::AppError,
    state::AppState,
    translator::{manager::TranslatorManager, types::TranslatorRequest},
};

#[tauri::command]
pub async fn translate_selected_text_in_popup(
    app: AppHandle,
    app_state: State<'_, AppState>,
    translator_manager: State<'_, TranslatorManager>,
    popup_state: State<'_, PopupState>,
    source_language: Option<String>,
    target_language: Option<String>,
    append: Option<bool>,
) -> Result<(), String> {
    let selected_text = match capture_selected_text_inner(app.clone()).await {
        Ok(text) => text,
        Err(error) => {
            show_popup(&app)?;
            publish_popup_payload(
                app,
                popup_state,
                PopupPayload {
                    status: "error".to_string(),
                    source_text: None,
                    translated_text: None,
                    error: Some(format!("{:#}", error)),
                    mode: Some("replace".to_string()),
                },
            )?;
            return Err(format!("{:#}", error));
        }
    };

    show_popup(&app)?;

    let append = append.unwrap_or(false);
    let mode = if append { "append" } else { "replace" }.to_string();
    let source_text = if append {
        let current_source_text = popup_state
            .get()?
            .and_then(|payload| payload.source_text)
            .unwrap_or_default();

        join_fragments(&current_source_text, &selected_text)
    } else {
        selected_text
    };

    publish_popup_payload(
        app.clone(),
        popup_state.clone(),
        PopupPayload {
            status: "translating".to_string(),
            source_text: Some(source_text.clone()),
            translated_text: None,
            error: None,
            mode: Some(mode.clone()),
        },
    )?;

    let providers = app_state
        .providers()
        .map_err(|error| format!("{:#}", error))?;

    match translator_manager
        .translate(
            providers,
            TranslatorRequest {
                text: source_text.clone(),
                source_language,
                target_language,
            },
        )
        .await
    {
        Ok(translated_text) => {
            publish_popup_payload(
                app,
                popup_state,
                PopupPayload {
                    status: "done".to_string(),
                    source_text: Some(source_text),
                    translated_text: Some(translated_text),
                    error: None,
                    mode: Some(mode),
                },
            )?;

            Ok(())
        }
        Err(error) => {
            let error = format!("{:#}", error);

            publish_popup_payload(
                app,
                popup_state,
                PopupPayload {
                    status: "error".to_string(),
                    source_text: Some(source_text),
                    translated_text: None,
                    error: Some(error.clone()),
                    mode: Some(mode),
                },
            )?;

            Err(error)
        }
    }
}

fn show_popup(app: &AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("translate-popup")
        .ok_or_else(|| "翻译弹窗尚未创建".to_string())?;

    window.show().map_err(|error| error.to_string())?;
    window.set_focus().map_err(|error| error.to_string())?;

    Ok(())
}

fn join_fragments(old: &str, next: &str) -> String {
    let old = old.trim();
    let next = next.trim();

    if old.is_empty() {
        return next.to_string();
    }

    if next.is_empty() {
        return old.to_string();
    }

    format!("{}\n{}", old, next)
}
