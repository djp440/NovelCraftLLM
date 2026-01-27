/**
 * Agent 配置及相关类型定义
 */

export interface AgentConfig {
    agent: {
        name: string;
        description: string;
        type: string;
        version: string;
        enabled: boolean;
        priority: number;
    };
    llm: {
        base_url: string;
        model: string;
        temperature: number;
        max_tokens: number;
        top_p?: number;
        frequency_penalty?: number;
        presence_penalty?: number;
        stop?: string[];
    };
    system_prompt: {
        content: string;
    };
    capabilities?: {
        multi_turn_dialogue?: boolean;
        context_memory?: boolean;
        memory_window?: number;
        sentiment_analysis?: boolean;
        intent_recognition?: boolean;
        requirement_extraction?: boolean;
    };
    interaction?: {
        max_turns?: number;
        response_timeout?: number;
        typing_effect?: boolean;
        typing_speed?: number;
        emojis_enabled?: boolean;
        voice_feedback?: boolean;
    };
    workflow?: {
        auto_task_allocation?: boolean;
        progress_tracking?: boolean;
        exception_handling?: boolean;
        max_concurrent_tasks?: number;
        task_timeout?: number;
    };
    output?: {
        format?: string;
        include_structured_data?: boolean;
    };
    [key: string]: any; // 支持额外的 TOML 字段
}

export interface AgentResponse {
    content: string;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    raw?: any;
}

export interface Message {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
    name?: string;
    tool_call_id?: string;
}
