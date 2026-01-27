/**
 * Agent 管理器
 * 负责初始化、缓存和提供各种 Agent 实例
 */

import { BaseAgent } from './BaseAgent';
import { ConfigLoader } from './ConfigLoader';
import { Logger } from '@/utils/logger';

const logger = new Logger({ filePrefix: 'agent-manager' });

export class AgentManager {
    private static instance: AgentManager;
    private agents: Map<string, BaseAgent> = new Map();

    private constructor() {}

    /**
     * 获取 AgentManager 单例
     */
    public static getInstance(): AgentManager {
        if (!AgentManager.instance) {
            AgentManager.instance = new AgentManager();
        }
        return AgentManager.instance;
    }

    /**
     * 获取指定的 Agent 实例
     * @param agentName Agent 名称 (如 'assistant', 'architect')
     * @param forceReload 是否强制重新加载配置并初始化
     */
    public getAgent(agentName: string, forceReload = false): BaseAgent {
        if (this.agents.has(agentName) && !forceReload) {
            return this.agents.get(agentName)!;
        }

        try {
            logger.info('AgentManager', `正在初始化 Agent: ${agentName}`);
            const config = ConfigLoader.loadConfig(agentName);
            const agent = new BaseAgent(config);
            this.agents.set(agentName, agent);
            return agent;
        } catch (error) {
            logger.error('AgentManager', `初始化 Agent 失败: ${agentName}, ${error}`);
            throw error;
        }
    }

    /**
     * 初始化所有可用的 Agent
     */
    public initAllAgents(): void {
        const availableAgents = ConfigLoader.listAvailableAgents();
        logger.info('AgentManager', `发现可用 Agent 列表: ${availableAgents.join(', ')}`);
        
        for (const agentName of availableAgents) {
            try {
                this.getAgent(agentName);
            } catch (error) {
                // 个别 Agent 初始化失败不影响整体
                logger.warn('AgentManager', `预初始化 Agent 失败: ${agentName}`);
            }
        }
    }

    /**
     * 清除所有 Agent 缓存（用于热重载配置）
     */
    public clearCache(): void {
        this.agents.clear();
        logger.info('AgentManager', 'Agent 缓存已清除');
    }
}
