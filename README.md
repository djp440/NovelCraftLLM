# NovelCraft LLM - AI小说生成系统

基于Next.js + TypeScript + SQLite的全栈AI小说生成系统。

## 项目概述

NovelCraft LLM是一个利用现代AI技术生成高质量小说的全栈应用程序。系统结合了大型语言模型、创意写作算法和用户交互界面，为用户提供智能小说创作体验。

## 技术栈

- **前端框架**: Next.js 14+ (App Router)
- **开发语言**: TypeScript
- **数据库**: SQLite (通过Prisma ORM)
- **UI组件**: React + Tailwind CSS
- **AI集成**: OpenAI API / 本地LLM
- **状态管理**: Zustand / React Context
- **测试框架**: Jest + React Testing Library
- **代码质量**: ESLint + Prettier

## 项目结构

```
novelcraft-llm/
├── config/              # 配置文件
├── src/                 # 源代码
│   ├── app/            # Next.js App Router
│   ├── components/     # React组件
│   ├── lib/           # 共享库和工具函数
│   ├── types/         # TypeScript类型定义
│   ├── agents/        # AI Agent实现
│   ├── db/            # 数据库相关代码
│   ├── utils/         # 工具函数
│   └── middleware/    # Next.js中间件
├── test/               # 测试脚本
├── logs/               # 日志文件
├── doc/               # 项目文档
└── public/            # 静态资源
```

## 功能特性

### 核心功能
- AI驱动的小说内容生成
- 多类型小说模板（奇幻、科幻、言情等）
- 角色和情节智能生成
- 实时写作辅助
- 作品版本管理

### 用户功能
- 用户认证和授权
- 作品收藏和分享
- 写作进度跟踪
- 个性化推荐

### 管理功能
- 内容审核系统
- 用户行为分析
- 系统性能监控

## 环境要求

- Node.js 18+ 
- npm 9+ 或 yarn 1.22+
- SQLite3

## 快速开始

### 1. 克隆项目
```bash
git clone <repository-url>
cd novelcraft-llm
```

### 2. 安装依赖
```bash
npm install
# 或
yarn install
```

### 3. 配置环境变量
复制 `.env.example` 到 `.env.local` 并填写必要的配置：
```bash
cp .env.example .env.local
```

### 4. 初始化数据库
```bash
npm run db:push
# 或
yarn db:push
```

### 5. 启动开发服务器
```bash
npm run dev
# 或
yarn dev
```

访问 http://localhost:3000 查看应用。

## 开发指南

### 代码规范
- 使用TypeScript严格模式
- 遵循ESLint和Prettier配置
- 组件使用函数式组件和React Hooks
- 使用Tailwind CSS进行样式设计

### 提交规范
遵循Conventional Commits规范：
- `feat:` 新功能
- `fix:` 修复bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建过程或辅助工具变动

## 部署

### 生产环境构建
```bash
npm run build
npm start
```

### 部署平台
- Vercel (推荐)
- AWS
- Docker容器化部署

## 贡献指南

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

- 项目维护者: [维护者名称]
- 问题反馈: [GitHub Issues](https://github.com/your-username/novelcraft-llm/issues)
- 文档: [项目Wiki](https://github.com/your-username/novelcraft-llm/wiki)