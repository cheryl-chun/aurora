use anyhow::{bail, Context, Result};
#[cfg(target_os = "macos")]
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::AppHandle;
use tauri_plugin_clipboard_manager::ClipboardExt;

#[cfg(not(target_os = "macos"))]
use enigo::{
    Direction::{Click, Press, Release},
    Enigo, Key, Keyboard, Settings,
};

#[cfg(target_os = "macos")]
use std::process::Command;

pub async fn capture_selected_text_inner(app: AppHandle) -> Result<String> {
    println!("[selection] capture start");

    #[cfg(target_os = "macos")]
    {
        match capture_selected_text_by_accessibility() {
            Ok(text) => {
                let text = text.trim().to_string();
                if !text.is_empty() {
                    println!("[selection] accessibility capture success");
                    return Ok(text);
                }

                println!("[selection] accessibility returned empty text");
            }
            Err(error) => {
                println!("[selection] accessibility capture failed: {:#}", error);
            }
        }
    }

    capture_selected_text_by_clipboard(app).await
}

async fn capture_selected_text_by_clipboard(app: AppHandle) -> Result<String> {
    println!("[selection] clipboard capture start");

    let old_clipboard = app.clipboard().read_text().ok();
    println!("[selection] old clipboard read");

    let sentinel = format!(
        "__AURORA_EMPTY_SELECTION_{}__",
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .context("读取系统时间失败")?
            .as_nanos()
    );

    app.clipboard()
        .write_text(sentinel.clone())
        .context("写入临时剪贴板失败")?;
    println!("[selection] sentinel written");

    tokio::time::sleep(std::time::Duration::from_millis(220)).await;

    println!("[selection] trigger copy start");
    trigger_copy_shortcut().context("触发复制快捷键失败")?;
    println!("[selection] trigger copy done");

    let selected_text = read_copied_selection(&app, &sentinel).await?;
    println!("[selection] clipboard read after copy");

    if let Some(old_text) = old_clipboard {
        let _ = app.clipboard().write_text(old_text);
        println!("[selection] clipboard restored");
    }

    let selected_text = selected_text.trim().to_string();

    if selected_text.is_empty() || selected_text == sentinel {
        bail!("没有选取文本");
    }

    println!("[selection] clipboard capture success");
    Ok(selected_text)
}

async fn read_copied_selection(app: &AppHandle, sentinel: &str) -> Result<String> {
    let mut last_text = String::new();

    for _ in 0..12 {
        tokio::time::sleep(std::time::Duration::from_millis(80)).await;

        let text = app.clipboard().read_text().context("读取剪贴板失败")?;

        let trimmed = text.trim().to_string();

        if !trimmed.is_empty() && trimmed != sentinel {
            return Ok(trimmed);
        }

        last_text = trimmed;
    }

    Ok(last_text)
}

#[cfg(target_os = "macos")]
fn capture_selected_text_by_accessibility() -> Result<String> {
    ensure_accessibility_permission()?;
    use core_foundation::base::{CFRelease, TCFType};
    use core_foundation::string::{CFString, CFStringRef};
    use core_foundation_sys::base::CFTypeRef;
    use std::ffi::c_void;

    type AXError = i32;
    type AXUIElementRef = *const c_void;

    const K_AX_ERROR_SUCCESS: AXError = 0;

    #[link(name = "ApplicationServices", kind = "framework")]
    extern "C" {
        fn AXUIElementCreateSystemWide() -> AXUIElementRef;

        fn AXUIElementCopyAttributeValue(
            element: AXUIElementRef,
            attribute: CFStringRef,
            value: *mut CFTypeRef,
        ) -> AXError;
    }

    unsafe {
        let system_wide = AXUIElementCreateSystemWide();

        if system_wide.is_null() {
            bail!("无法创建 Accessibility system-wide element");
        }

        let focused_attr = CFString::new("AXFocusedUIElement");
        let mut focused_value: CFTypeRef = std::ptr::null();

        let focused_error = AXUIElementCopyAttributeValue(
            system_wide,
            focused_attr.as_concrete_TypeRef(),
            &mut focused_value,
        );

        CFRelease(system_wide as CFTypeRef);

        if focused_error != K_AX_ERROR_SUCCESS || focused_value.is_null() {
            bail!(
                "无法通过 Accessibility 读取焦点元素，AXError={}, value_is_null={}",
                focused_error,
                focused_value.is_null()
            );
        }

        let selected_attr = CFString::new("AXSelectedText");
        let mut selected_value: CFTypeRef = std::ptr::null();

        let selected_error = AXUIElementCopyAttributeValue(
            focused_value as AXUIElementRef,
            selected_attr.as_concrete_TypeRef(),
            &mut selected_value,
        );

        CFRelease(focused_value);

        if selected_error != K_AX_ERROR_SUCCESS || selected_value.is_null() {
            bail!("当前应用没有暴露选中文本");
        }

        let selected_text =
            CFString::wrap_under_create_rule(selected_value as CFStringRef).to_string();

        Ok(selected_text)
    }
}

#[cfg(target_os = "macos")]
fn ensure_accessibility_permission() -> Result<()> {
    use core_foundation::base::TCFType;
    use core_foundation::boolean::CFBoolean;
    use core_foundation::dictionary::CFDictionary;
    use core_foundation::string::CFString;
    use core_foundation_sys::base::CFTypeRef;

    #[link(name = "ApplicationServices", kind = "framework")]
    extern "C" {
        fn AXIsProcessTrustedWithOptions(options: CFTypeRef) -> u8;
    }

    let prompt_key = CFString::new("AXTrustedCheckOptionPrompt");
    let prompt_value = CFBoolean::true_value();

    let options =
        CFDictionary::from_CFType_pairs(&[(prompt_key.as_CFType(), prompt_value.as_CFType())]);

    let trusted =
        unsafe { AXIsProcessTrustedWithOptions(options.as_concrete_TypeRef() as CFTypeRef) != 0 };

    if !trusted {
        bail!("未授予辅助功能权限");
    }

    Ok(())
}

#[cfg(target_os = "macos")]
fn trigger_copy_shortcut() -> Result<()> {
    let output = Command::new("osascript")
        .args([
            "-e",
            r#"tell application "System Events" to keystroke "c" using command down"#,
        ])
        .output()
        .context("执行 osascript 失败")?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        bail!("osascript 复制失败：{}", stderr.trim());
    }

    Ok(())
}

#[cfg(not(target_os = "macos"))]
fn trigger_copy_shortcut() -> Result<()> {
    let mut enigo = Enigo::new(&Settings::default()).context("初始化输入模拟失败")?;

    let modifier = Key::Control;

    enigo.key(modifier, Press)?;
    std::thread::sleep(std::time::Duration::from_millis(40));

    enigo.key(Key::Unicode('c'), Click)?;
    std::thread::sleep(std::time::Duration::from_millis(40));

    enigo.key(modifier, Release)?;

    Ok(())
}
