use tauri::{AppHandle, State};

use crate::{models::provider::ApiProvider, state::AppState, storage::provider};

#[tauri::command]
pub fn load_api_providers(state: State<AppState>) -> Result<Vec<ApiProvider>, String> {
    state.providers().map_err(|err| format!("{:#}", err))
}

#[tauri::command]
pub fn save_api_providers(
    app: AppHandle,
    state: State<AppState>,
    mut api_providers: Vec<ApiProvider>,
) -> Result<(), String> {
    api_providers.sort_by_key(|provider| provider.priority);

    provider::save(&app, api_providers.clone()).map_err(|err| format!("{:#}", err))?;

    state
        .replace_providers(api_providers)
        .map_err(|err| format!("{:#}", err))?;

    Ok(())
}
