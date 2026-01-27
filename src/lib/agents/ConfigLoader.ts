/**
 * Agent 配置加载器
 * 负责从 config 目录读取 TOML 配置文件
 */

import fs from 'fs';
import path from 'path';
import toml from 'toml';
import { AgentConfig } from './types';
import { Logger } from '@/utils/logger';

const logger = new Logger({ filePrefix: 'config-loader' });

export class ConfigLoader {
    private static configDir = path.join(process.cwd(), 'config');

    /**
     * 加载指定 Agent 的配置
     * @param agentName Agent 名称 (如 'assistant', 'architect')
     */
    public static loadConfig(agentName: string): AgentConfig {
        const filePath = path.join(this.configDir, `${agentName}.toml`);
        
        if (!fs.existsSync(filePath)) {
            const errorMsg = `配置文件未找到: ${filePath}`;
            logger.error('ConfigLoader', errorMsg);
            throw new Error(errorMsg);
        }

        try {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const config = toml.parse(fileContent) as AgentConfig;
            
            // 验证必要字段
            if (!config.agent || !config.llm || !config.system_prompt) {
                throw new Error(`配置文件格式错误: ${agentName}.toml 缺少必要部分`);
            }

            logger.info('ConfigLoader', `成功加载配置: ${agentName}.toml`);
            return config;
        } catch (error) {
            const errorMsg = `解析配置文件失败: ${agentName}.toml, ${error}`;
            logger.error('ConfigLoader', errorMsg);
            throw new Error(errorMsg);
        }
    }

    /**
     * 获取所有可用的 Agent 配置名称
     */
    public static listAvailableAgents(): string[] {
        try {
            const files = fs.readdirSync(this.configDir);
            return files
                .filter(f => f.endsWith('.toml') && !['app.toml', 'database.toml'].includes(f))
                .map(f => f.replace('.toml', ''));
        } catch (error) {
            logger.error('ConfigLoader', `获取配置列表失败: ${error}`);
            return [];
        }
    }
}
