/**
 * Agent 基类
 * 封装了与 OpenAI SDK 的交互逻辑
 */

import OpenAI from 'openai';
import { AgentConfig, AgentResponse, Message } from './types';
import { Logger } from '@/utils/logger';

const logger = new Logger({ filePrefix: 'agent' });

export class BaseAgent {
    protected client: OpenAI;
    protected config: AgentConfig;
    protected name: string;

    constructor(config: AgentConfig) {
        this.config = config;
        this.name = config.agent.name;

        // 初始化 OpenAI 客户端
        // 优先从配置读取 base_url，否则使用环境变量
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            const errorMsg = `未在环境变量中找到 OPENAI_API_KEY`;
            logger.error(this.name, errorMsg);
            throw new Error(errorMsg);
        }

        this.client = new OpenAI({
            apiKey: apiKey,
            baseURL: config.llm.base_url || process.env.OPENAI_API_BASE,
        });
    }

    /**
     * 获取 Agent 名称
     */
    public getName(): string {
        return this.name;
    }

    /**
     * 获取 Agent 类型
     */
    public getType(): string {
        return this.config.agent.type;
    }

    /**
     * 执行对话请求
     * @param messages 对话消息列表
     * @param stream 是否开启流式输出 (当前暂不支持流式返回，仅内部处理)
     */
    public async chat(messages: Message[]): Promise<AgentResponse> {
        try {
            logger.info(this.name, `开始对话请求，消息数: ${messages.length}`);

            // 构造完整的消息列表，加入 System Prompt
            const fullMessages: Message[] = [
                { role: 'system', content: this.config.system_prompt.content },
                ...messages
            ];

            const response = await this.client.chat.completions.create({
                model: this.config.llm.model,
                messages: fullMessages as any,
                temperature: this.config.llm.temperature,
                max_tokens: this.config.llm.max_tokens,
                top_p: this.config.llm.top_p,
                frequency_penalty: this.config.llm.frequency_penalty,
                presence_penalty: this.config.llm.presence_penalty,
                stop: this.config.llm.stop,
            });

            const choice = response.choices[0];
            const content = choice.message.content || '';

            logger.info(this.name, `对话请求成功，消耗 tokens: ${response.usage?.total_tokens || 0}`);

            return {
                content,
                usage: response.usage ? {
                    prompt_tokens: response.usage.prompt_tokens,
                    completion_tokens: response.usage.completion_tokens,
                    total_tokens: response.usage.total_tokens,
                } : undefined,
                raw: response
            };
        } catch (error) {
            logger.error(this.name, `对话请求失败: ${error}`);
            throw error;
        }
    }

    /**
     * 流式对话请求
     * @param messages 对话消息列表
     * @param onChunk 收到数据块时的回调
     */
    public async chatStream(messages: Message[], onChunk: (chunk: string) => void): Promise<void> {
        try {
            logger.info(this.name, `开始流式对话请求`);

            const fullMessages: Message[] = [
                { role: 'system', content: this.config.system_prompt.content },
                ...messages
            ];

            const stream = await this.client.chat.completions.create({
                model: this.config.llm.model,
                messages: fullMessages as any,
                temperature: this.config.llm.temperature,
                max_tokens: this.config.llm.max_tokens,
                top_p: this.config.llm.top_p,
                frequency_penalty: this.config.llm.frequency_penalty,
                presence_penalty: this.config.llm.presence_penalty,
                stop: this.config.llm.stop,
                stream: true,
            });

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) {
                    onChunk(content);
                }
            }

            logger.info(this.name, `流式对话结束`);
        } catch (error) {
            logger.error(this.name, `流式对话失败: ${error}`);
            throw error;
        }
    }
}
