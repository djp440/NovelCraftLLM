# Next.js Middleware 测试指南

## 概述

已成功实现Next.js Middleware来保护`/workbench`路由。本指南说明如何测试和验证middleware功能。

## 实现的功能

1. **路由保护**：保护所有以`/workbench`开头的路由
2. **JWT验证**：检查Authorization头或cookie中的JWT令牌
3. **重定向机制**：验证失败时重定向到`/login`页面
4. **令牌提取**：支持从多个位置提取令牌：
   - Authorization头：`Bearer <token>`
   - Cookie：`token=<token>`
   - 查询参数：`?token=<token>`（仅用于测试）
5. **开发日志**：在开发环境中记录详细的执行日志

## 文件结构

```
src/
├── middleware.ts              # Middleware主文件
├── app/
│   ├── workbench/
│   │   └── page.tsx          # 受保护的工作台页面
│   ├── login/
│   │   └── page.tsx          # 登录页面
│   └── page.tsx              # 首页（公开）
└── auth/
    ├── utils.ts              # JWT验证函数
    └── types.ts              # 类型定义
```

## 测试步骤

### 1. 启动开发服务器

```bash
npm run dev
```

### 2. 测试公开路由（不需要认证）

访问以下路由应该可以直接访问：

- `http://localhost:3000/` - 首页
- `http://localhost:3000/login` - 登录页面
- `http://localhost:3000/api/auth/login` - 登录API
- `http://localhost:3000/api/auth/register` - 注册API

### 3. 测试受保护路由（需要认证）

访问以下路由应该被重定向到登录页面：

- `http://localhost:3000/workbench` - 工作台主页面
- `http://localhost:3000/workbench/projects` - 工作台子页面
- `http://localhost:3000/workbench/any-path` - 任何以/workbench开头的路径

### 4. 测试JWT验证

#### 场景1：没有令牌
1. 清除浏览器cookie
2. 访问 `http://localhost:3000/workbench`
3. 预期：被重定向到 `http://localhost:3000/login?redirect=/workbench`

#### 场景2：有效令牌
1. 使用演示登录功能（点击"使用演示账户登录"）
2. 令牌会自动设置到cookie
3. 访问 `http://localhost:3000/workbench`
4. 预期：成功访问工作台页面

#### 场景3：无效令牌
1. 手动设置一个无效的cookie：`document.cookie = "token=invalid-token; path=/"`
2. 访问 `http://localhost:3000/workbench`
3. 预期：被重定向到登录页面

### 5. 测试Authorization头

对于API请求，可以通过Authorization头传递令牌：

```bash
# 使用curl测试
curl -H "Authorization: Bearer valid-token" http://localhost:3000/workbench
```

## Middleware配置

### 匹配规则
middleware配置为匹配所有路由，但排除以下静态资源：
- `_next/static/*` - Next.js静态文件
- `_next/image/*` - 图片优化文件
- `favicon.ico` - 网站图标
- 图片文件（.svg, .png, .jpg, .jpeg, .gif, .webp, .ico）

### 保护规则
- **受保护前缀**：`/workbench`
- **公开路由**：`/`, `/login`, `/register`, `/api/auth/*`

## 开发日志

在开发环境中，middleware会输出详细的日志：

```
[Middleware] 处理请求: /workbench
[Middleware] 访问受保护路由 /workbench 但未提供JWT令牌
[Middleware] JWT验证成功，用户: demo@example.com, 路径: /workbench
```

## 自定义配置

### 修改受保护路由
编辑 `src/middleware.ts` 中的 `PROTECTED_PREFIXES` 数组：

```typescript
const PROTECTED_PREFIXES = ['/workbench', '/admin', '/dashboard'];
```

### 修改公开路由
编辑 `src/middleware.ts` 中的 `PUBLIC_ROUTES` 数组：

```typescript
const PUBLIC_ROUTES = [
    '/',
    '/login',
    '/register',
    '/about',
    '/api/auth/*',
];
```

### 调整令牌过期检查
默认检查令牌是否在30分钟内过期，可以修改 `isTokenExpiringSoon` 函数：

```typescript
// 修改为15分钟
return expiresIn > 0 && expiresIn < 15 * 60;
```

## 故障排除

### 问题1：middleware不生效
- 检查文件位置：确保middleware.ts在src目录根层
- 检查Next.js版本：需要Next.js 12.2+ 支持middleware
- 检查TypeScript错误：运行 `npx tsc --noEmit` 检查编译错误

### 问题2：无限重定向循环
- 确保登录页面在 `PUBLIC_ROUTES` 列表中
- 检查重定向逻辑是否正确处理登录页面

### 问题3：JWT验证失败
- 检查JWT_SECRET环境变量是否设置
- 验证verifyToken函数是否正确实现
- 检查令牌格式是否正确

## 生产环境注意事项

1. **环境变量**：确保设置 `JWT_SECRET` 环境变量
2. **Cookie安全**：生产环境中应使用httpOnly和secure cookie
3. **令牌刷新**：考虑实现令牌刷新机制
4. **速率限制**：添加API请求速率限制
5. **监控日志**：在生产环境中减少详细日志输出

## 扩展功能建议

1. **角色权限控制**：基于用户角色限制访问
2. **多因素认证**：支持2FA验证
3. **会话管理**：添加会话超时和主动注销
4. **审计日志**：记录所有受保护路由的访问
5. **地理限制**：基于IP地址限制访问

## 总结

已成功实现了一个健壮的Next.js Middleware，提供了完整的路由保护功能。该实现遵循最佳实践，具有良好的可扩展性和可维护性。