use anyhow::Error;
use serde::Serialize;

pub type AppResult<T> = Result<T, AppError>;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppError {
    pub code: AppErrorCode,
    pub message: String,
    pub details: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum AppErrorCode {
    InvalidInput,
    NoSelectedText,
    ClipboardReadFailed,
    NoEnabledProvider,
    ProviderUnsupported,
    ProviderConfigMissing,
    ProviderRequestFailed,
    ProviderResponseInvalid,
    TranslationEmpty,
    PopupWindowNotFound,
    PopupStateFailed,
    WindowOperationFailed,
    ConfigReadFailed,
    ConfigWriteFailed,
    StateReadFailed,
    StateWriteFailed,
}

impl AppError {
    pub fn new(code: AppErrorCode, message: impl Into<String>) -> Self {
        Self {
            code,
            message: message.into(),
            details: None,
        }
    }

    pub fn with_details(
        code: AppErrorCode,
        message: impl Into<String>,
        details: impl Into<String>,
    ) -> Self {
        Self {
            code,
            message: message.into(),
            details: Some(details.into()),
        }
    }

    pub fn from_anyhow(code: AppErrorCode, error: Error) -> Self {
        Self::with_details(code, error.to_string(), format!("{:#}", error))
    }

    pub fn message(&self) -> &str {
        &self.message
    }
}
