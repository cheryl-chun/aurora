use tauri::{AppHandle, State};

use crate::{
    models::{
        error::{AppError, AppErrorCode, AppResult},
        provider::ApiProvider,
    },
    state::AppState,
    storage::provider,
};

#[tauri::command]
pub fn load_api_providers(state: State<AppState>) -> AppResult<Vec<ApiProvider>> {
    state.providers()
}

#[tauri::command]
pub fn save_api_providers(
    app: AppHandle,
    state: State<AppState>,
    mut api_providers: Vec<ApiProvider>,
) -> AppResult<()> {
    api_providers.sort_by_key(|provider| provider.priority);

    provider::save(&app, api_providers.clone())
        .map_err(|error| AppError::from_anyhow(AppErrorCode::ConfigWriteFailed, error))?;

    state.replace_providers(api_providers)?;

    Ok(())
}
