export type ApiProviderType = "llm" | "translator";

export type ApiProvider = {
    id: string;
    name: string;
    provider_type: ApiProviderType;
    base_url: string;
    api_key: string;
    model?: string;
    prompt_template?: string;
    enabled: boolean;
    priority: number;
}

// export type ToastState = {
//   message: string;
//   type: "success" | "error" | "info";
// };