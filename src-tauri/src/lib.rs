mod commands;
mod models;
mod state;
mod storage;
mod translator;
mod tray;

use commands::popup::{clear_popup_payload, get_popup_payload, PopupState};
use commands::providers::{load_api_providers, save_api_providers};
use commands::selection_translate::translate_selected_text_in_popup;
use commands::settings::{load_app_settings, save_app_settings};
use commands::translate::translate_text;
use commands::window::hide_main_window;
use tauri::Manager;

use crate::state::AppState;
use crate::translator::manager::TranslatorManager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            let providers = storage::provider::load(app.handle()).unwrap_or_else(|err| {
                eprintln!("加载 API 配置失败: {}", err);
                Vec::new()
            });

            app.manage(AppState::new(providers));
            app.manage(TranslatorManager::new());
            app.manage(PopupState::new());

            tray::setup_tray(app)?;

            if let Some(window) = app.get_webview_window("main") {
                let _ = window.hide();
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            translate_text,
            save_api_providers,
            load_api_providers,
            translate_selected_text_in_popup,
            hide_main_window,
            get_popup_payload,
            clear_popup_payload,
            load_app_settings,
            save_app_settings
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
