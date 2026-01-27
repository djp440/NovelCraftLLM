/**
 * Agent 系统集成测试脚本
 * 验证配置加载、Agent 初始化及简单的 API 调用
 */

import dotenv from 'dotenv';
import path from 'path';
import { AgentManager } from '../src/lib/agents/AgentManager';
import { LogLevel } from '../src/utils/logger';

// 加载 .env
dotenv.config();

async function testAgents() {
    console.log('🚀 开始 Agent 系统集成测试...');

    try {
        const manager = AgentManager.getInstance();

        // 1. 测试列出所有 Agent
        console.log('\n--- 1. 测试列出可用 Agent ---');
        const { ConfigLoader } = require('../src/lib/agents/ConfigLoader');
        const agents = ConfigLoader.listAvailableAgents();
        console.log('可用 Agent:', agents);

        if (agents.length === 0) {
            throw new Error('未发现任何 Agent 配置文件！');
        }

        // 2. 测试初始化 Assistant Agent
        console.log('\n--- 2. 测试初始化 Assistant Agent ---');
        const assistant = manager.getAgent('assistant');
        console.log(`成功初始化 Agent: ${assistant.getName()} (Type: ${assistant.getType()})`);

        // 3. 测试 API 调用 (可选，需要有效的 API KEY)
        if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
            console.log('\n--- 3. 测试 API 调用 (Assistant) ---');
            const response = await assistant.chat([
                { role: 'user', content: '你好，请简单介绍一下你自己。' }
            ]);
            console.log('Assistant 回复:', response.content);
            console.log('Token 消耗:', response.usage);
        } else {
            console.log('\n--- 3. 跳过 API 调用测试 (未检测到有效的 API KEY) ---');
        }

        // 4. 测试流式输出 (可选)
        if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
            console.log('\n--- 4. 测试流式 API 调用 (Assistant) ---');
            process.stdout.write('Assistant 流式回复: ');
            await assistant.chatStream(
                [{ role: 'user', content: '请用一句话描述什么是好小说。' }],
                (chunk) => {
                    process.stdout.write(chunk);
                }
            );
            console.log('\n流式输出结束。');
        }

        console.log('\n✅ 所有测试完成！');

    } catch (error) {
        console.error('\n❌ 测试过程中发生错误:', error);
        process.exit(1);
    }
}

testAgents();
