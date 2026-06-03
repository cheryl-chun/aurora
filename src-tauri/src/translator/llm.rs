use crate::{
    models::{
        error::{AppError, AppErrorCode, AppResult},
        provider::ApiProvider,
    },
    translator::types::{TokenUsage, Translator, TranslatorRequest, TranslatorResponse},
};
use async_trait::async_trait;
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
struct ChatRequest {
    model: String,
    messages: Vec<ChatMessage>,
    temperature: f32,
}

#[derive(Serialize)]
struct ChatMessage {
    role: String,
    content: String,
}

#[derive(Deserialize)]
struct ChatResponse {
    choices: Vec<ChatChoice>,
    usage: Option<ChatUsage>,
}

#[derive(Deserialize)]
struct ChatChoice {
    message: ChatResponseMessage,
}

#[derive(Deserialize)]
struct ChatResponseMessage {
    content: String,
}

#[derive(Deserialize)]
struct ChatUsage {
    prompt_tokens: Option<u32>,
    completion_tokens: Option<u32>,
    total_tokens: Option<u32>,
}

pub struct LlmTranslator {
    provider: ApiProvider,
    client: reqwest::Client,
}

impl LlmTranslator {
    pub fn new(provider: ApiProvider, client: reqwest::Client) -> Self {
        Self { provider, client }
    }
}

#[async_trait]
impl Translator for LlmTranslator {
    async fn translate(&self, request: TranslatorRequest) -> AppResult<TranslatorResponse> {
        let api_key = self.provider.api_key.trim();
        if api_key.is_empty() {
            return Err(AppError::new(
                AppErrorCode::ProviderConfigMissing,
                format!("{} 缺少 API key", self.provider.name),
            ));
        }

        let base_url = self.provider.base_url.trim();
        if base_url.is_empty() {
            return Err(AppError::new(
                AppErrorCode::ProviderConfigMissing,
                format!("{} 缺少 Base URL", self.provider.name),
            ));
        }

        let model = self
            .provider
            .model
            .as_deref()
            .map(str::trim)
            .filter(|value| !value.is_empty())
            .ok_or_else(|| AppError::new(AppErrorCode::ProviderConfigMissing, "LLM 缺少 Model"))?
            .to_string();

        let prompt = render_prompt(
            self.provider.prompt_template.as_deref(),
            &request.text,
            request.source_language.as_deref(),
            request.target_language.as_deref(),
        );

        let url = format!("{}/chat/completions", base_url.trim_end_matches('/'));

        let use_model = model.clone();

        let body = ChatRequest {
            model,
            temperature: 0.2,
            messages: vec![ChatMessage {
                role: "user".to_string(),
                content: prompt,
            }],
        };

        println!(
            "[llm] request provider={}, base_url={}, model={}",
            self.provider.name, url, use_model
        );

        let response = self
            .client
            .post(url)
            .bearer_auth(api_key)
            .json(&body)
            .send()
            .await
            .map_err(|error| {
                AppError::with_details(
                    AppErrorCode::ProviderRequestFailed,
                    format!("请求 {} 失败", self.provider.name),
                    error.to_string(),
                )
            })?;

        println!(
            "[llm] response provider={}, status={}",
            self.provider.name,
            response.status()
        );

        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();

            eprintln!(
                "[llm] error provider={}, status={}, body={}",
                self.provider.name, status, body
            );

            return Err(AppError::with_details(
                AppErrorCode::ProviderRequestFailed,
                format!("{} 返回错误: {}", self.provider.name, status),
                body,
            ));
        }

        let data = response.json::<ChatResponse>().await.map_err(|error| {
            AppError::with_details(
                AppErrorCode::ProviderResponseInvalid,
                format!("解析 {} 响应失败", self.provider.name),
                error.to_string(),
            )
        })?;

        println!("[llm] response parsed provider={}", self.provider.name);

        let translated = data
            .choices
            .first()
            .map(|choice| choice.message.content.trim().to_string())
            .filter(|content| !content.is_empty())
            .ok_or_else(|| AppError::new(AppErrorCode::TranslationEmpty, "LLM 没有返回翻译内容"))?;

        let usage = data.usage.map(|usage| TokenUsage {
            prompt_tokens: usage.prompt_tokens,
            completion_tokens: usage.completion_tokens,
            total_tokens: usage.total_tokens,
        });

        println!("[llm] translated={}", translated);
        Ok(TranslatorResponse {
            content: translated,
            usage,
        })
    }
}

fn render_prompt(
    template: Option<&str>,
    text: &str,
    source_language: Option<&str>,
    target_language: Option<&str>,
) -> String {
    let fallback = r#"你是一个专业的翻译引擎
请把用户输入翻译成{{target_language}}。

要求：
- 只输出译文
- 不要解释
- 保留代码、命令、变量名、URL、Markdown 格式

源语言：{{source_language}}
目标语言：{{target_language}}

原文：
{{text}}"#;

    let template = template
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .unwrap_or(fallback);

    let source_language = normalize_language(source_language.unwrap_or("auto"));
    let target_language = normalize_language(target_language.unwrap_or("zh-CN"));

    let rendered = template
        .replace("{{text}}", text)
        .replace("{{source_language}}", source_language)
        .replace("{{target_language}}", target_language);

    if template.contains("{{text}}") {
        rendered
    } else {
        format!("{}\n\n原文: \n{}", rendered, text)
    }
}

fn normalize_language(value: &str) -> &str {
    match value {
        "auto" => "自动检测",
        "zh-CN" => "简体中文",
        "en" => "英语",
        "ja" => "日语",
        "ko" => "韩语",
        "fr" => "法语",
        "de" => "德语",
        other => other,
    }
}
