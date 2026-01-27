# AI小说生成系统 - 配置文件说明

## 概述

本目录包含AI小说生成系统的所有配置文件，采用TOML格式。配置文件分为基础配置和Agent配置两大类。

## 文件结构

```
config/
├── app.toml              # 应用基础配置
├── database.toml         # 数据库配置
├── assistant.toml        # 助理Agent配置
├── architect.toml        # 架构师Agent配置
├── data-keeper.toml      # 数据维护员Agent配置
├── writer.toml           # 作家Agent配置
├── reviewer.toml         # 审阅员Agent配置
├── compressor.toml       # 压缩者Agent配置
└── README.md            # 本说明文档
```

## 配置文件说明

### 1. app.toml - 应用基础配置
- **用途**: 系统全局设置
- **主要配置项**:
  - `[app]`: 应用基本信息（名称、版本、环境等）
  - `[server]`: 服务器配置（主机、端口、API前缀等）
  - `[ai]`: AI默认参数（提供商、模型、温度等）
  - `[rate_limit]`: 速率限制配置
  - `[cache]`: 缓存配置
  - `[security]`: 安全配置
  - `[features]`: 功能开关

### 2. database.toml - 数据库配置
- **用途**: 数据库连接和存储设置
- **主要配置项**:
  - `[database]`: 数据库通用配置
  - `[postgresql]`: PostgreSQL特定配置
  - `[mysql]`: MySQL特定配置
  - `[sqlite]`: SQLite特定配置
  - `[mongodb]`: MongoDB特定配置
  - `[tables]`: 数据库表配置
  - `[backup]`: 备份配置
  - `[performance]`: 性能优化配置

### 3. Agent配置文件

#### 3.1 assistant.toml - 助理Agent
- **职责**: 用户交互、任务协调、初步需求分析
- **关键配置**:
  - `[llm]`: 大语言模型参数（base_url、model、temperature等）
  - `[system_prompt]`: 系统提示词
  - `[capabilities]`: Agent能力配置
  - `[interaction]`: 交互配置
  - `[workflow]`: 工作流配置

#### 3.2 architect.toml - 架构师Agent
- **职责**: 小说结构设计、章节规划、整体架构
- **关键配置**:
  - `[structure]`: 结构设计配置
  - `[templates]`: 模板配置
  - `[validation]`: 验证配置
  - `[integration]`: 集成配置

#### 3.3 data-keeper.toml - 数据维护员Agent
- **职责**: 数据管理、存储、检索、一致性维护
- **关键配置**:
  - `[storage]`: 存储配置
  - `[data_types]`: 数据类型配置
  - `[validation]`: 验证配置
  - `[backup]`: 备份配置
  - `[consistency]`: 一致性配置

#### 3.4 writer.toml - 作家Agent
- **职责**: 根据架构师设计生成具体小说内容
- **关键配置**:
  - `[writing]`: 写作配置
  - `[quality]`: 质量配置
  - `[creativity]`: 创意配置
  - `[output]`: 输出配置

#### 3.5 reviewer.toml - 审阅员Agent
- **职责**: 审核和评估生成的小说内容质量
- **关键配置**:
  - `[evaluation]`: 评估配置
  - `[quality]`: 质量配置
  - `[feedback]`: 反馈配置
  - `[validation]`: 验证配置

#### 3.6 compressor.toml - 压缩者Agent
- **职责**: 内容压缩、摘要生成、优化
- **关键配置**:
  - `[compression]`: 压缩配置
  - `[summarization]`: 摘要配置
  - `[optimization]`: 优化配置
  - `[quality]`: 质量配置

## 配置继承关系

所有Agent配置文件都继承以下通用配置项：

1. **`[agent]`**: Agent基本信息
   - `name`: Agent名称
   - `description`: Agent描述
   - `type`: Agent类型
   - `version`: 版本号
   - `enabled`: 是否启用
   - `priority`: 执行优先级

2. **`[llm]`**: 大语言模型配置
   - `base_url`: 基础API URL（默认：https://api.deepseek.com）
   - `model`: 模型名称（默认：deepseek-chat）
   - `temperature`: 温度参数
   - `max_tokens`: 最大token数
   - `top_p`: Top-p采样参数

3. **`[system_prompt]`**: 系统提示词
   - `content`: Agent的职责和能力的详细描述

## 配置优先级

1. **环境变量** > **配置文件** > **默认值**
2. Agent配置会覆盖应用全局配置
3. 运行时配置会覆盖文件配置

## 配置验证

所有配置文件都经过以下验证：
- TOML格式正确性
- 必要配置项完整性
- 配置值有效性检查
- 类型一致性验证

## 配置更新

### 热更新支持
以下配置支持热更新（无需重启服务）：
- `app.toml`中的`[rate_limit]`、`[cache]`部分配置
- Agent配置文件中的`[llm]`参数（除base_url外）
- 所有性能相关配置

### 需要重启的配置
以下配置修改后需要重启服务：
- `app.toml`中的`[server]`配置
- `database.toml`中的数据库连接配置
- Agent的`[system_prompt]`内容

## 最佳实践

### 1. 环境特定配置
建议为不同环境创建配置副本：
- `config/app.dev.toml` - 开发环境
- `config/app.staging.toml` - 测试环境
- `config/app.prod.toml` - 生产环境

### 2. 敏感信息管理
- 数据库密码、API密钥等敏感信息应通过环境变量注入
- 不要将敏感信息直接写入配置文件
- 使用`.env`文件管理本地开发环境变量

### 3. 配置版本控制
- 将配置文件纳入版本控制
- 使用配置模板避免硬编码
- 记录重要的配置变更

### 4. 监控和告警
- 监控配置加载状态
- 设置配置变更告警
- 定期审计配置安全性

## 故障排除

### 常见问题

1. **配置加载失败**
   - 检查TOML格式是否正确
   - 验证文件编码（应为UTF-8）
   - 确认文件权限

2. **配置值无效**
   - 检查配置项的数据类型
   - 验证取值范围
   - 确认依赖配置项是否已设置

3. **配置继承问题**
   - 检查配置加载顺序
   - 验证配置覆盖逻辑
   - 确认环境变量优先级

### 调试工具

1. **配置验证命令**:
   ```bash
   # 验证TOML格式
   python -m tomli config/app.toml
   
   # 验证配置完整性
   npm run validate-config
   ```

2. **配置查看命令**:
   ```bash
   # 查看当前生效配置
   npm run show-config
   
   # 导出配置为JSON
   npm run export-config
   ```

## 相关文档

- [系统架构设计](../doc/架构设计.md)
- [数据库设计](../doc/数据库设计.md)
- [API接口文档](../doc/API文档.md)
- [部署指南](../doc/部署指南.md)

## 更新日志

### v1.0.0 (2026-01-27)
- 初始版本，创建所有基础配置文件
- 实现6个Agent的完整配置
- 添加配置说明文档
- 支持TOML格式配置管理

---

**注意**: 本配置文件结构为AI小说生成系统的核心配置，请根据实际部署环境进行适当调整。如有疑问，请参考相关技术文档或联系系统管理员。