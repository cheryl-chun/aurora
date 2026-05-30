use serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppError {
    pub code: AppErrorCode,
    pub message: String,
    pub details: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum AppErrorCode {
    NoSelectedText,
    ClipboardReadFailed,
    ClipboardWriteFailed,
    TriggerCopyFailed,
    NoEnabledProvider,
    ProviderRequestFailed,
    ProviderResponseInvalid,
    TranslationEmpty,
    PopupWindowNotFound,
    ConfigReadFailed,
    ConfigWriteFailed,
    Unknown,
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
}