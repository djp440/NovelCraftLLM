# 测试目录说明

本目录包含NovelCraftLLM项目的所有测试代码和相关配置文件。

## 目录结构

```
test/
├── unit/              # 单元测试
├── integration/       # 集成测试
├── e2e/              # 端到端测试
├── fixtures/         # 测试夹具数据
├── mocks/            # 模拟对象
├── jest.config.js    # Jest测试配置
├── setup.js          # 测试环境设置
└── README.md         # 本文件
```

## 测试类型说明

### 1. 单元测试 (unit/)
- 测试独立的函数、类或模块
- 不依赖外部资源（数据库、API等）
- 使用模拟对象隔离测试

### 2. 集成测试 (integration/)
- 测试多个模块的交互
- 测试与外部服务的集成
- 可能需要真实的数据库连接

### 3. 端到端测试 (e2e/)
- 测试完整的用户流程
- 模拟真实用户操作
- 测试整个应用的功能

### 4. 测试夹具 (fixtures/)
- 测试数据文件
- 配置文件
- 模拟数据

### 5. 模拟对象 (mocks/)
- 外部服务的模拟实现
- API响应的模拟数据
- 数据库操作的模拟

## 测试配置

### Jest配置
项目使用Jest作为测试框架，配置文件位于 `test/jest.config.js`。

主要配置项：
- 测试环境：Node.js
- 测试文件匹配模式：`*.test.js` 和 `*.spec.js`
- 覆盖率报告：HTML、LCOV、文本格式
- 模块映射：支持 `@/` 别名

### 测试环境设置
`test/setup.js` 文件在测试运行前执行，用于：
- 设置测试环境变量
- 配置全局测试设置
- 初始化测试环境

## 运行测试

### 安装测试依赖
```bash
npm install --save-dev jest @types/jest ts-jest
```

### 运行所有测试
```bash
npx jest
```

### 运行特定测试
```bash
# 运行单元测试
npx jest test/unit

# 运行特定测试文件
npx jest test/unit/example.test.js

# 运行匹配模式的测试
npx jest --testNamePattern="加法"
```

### 生成覆盖率报告
```bash
npx jest --coverage
```

## 编写测试

### 基本测试结构
```javascript
describe('测试套件名称', () => {
  beforeEach(() => {
    // 每个测试前执行
  });

  afterEach(() => {
    // 每个测试后执行
  });

  test('测试用例描述', () => {
    // 测试断言
    expect(actual).toBe(expected);
  });
});
```

### 异步测试
```javascript
test('异步操作测试', async () => {
  const result = await asyncFunction();
  expect(result).toBe(expected);
});
```

### 模拟测试
```javascript
test('模拟函数测试', () => {
  const mockFn = jest.fn();
  mockFn.mockReturnValue('mock value');
  
  const result = mockFn();
  expect(result).toBe('mock value');
  expect(mockFn).toHaveBeenCalledTimes(1);
});
```

## 测试最佳实践

1. **测试命名**：使用描述性的测试名称
2. **单一职责**：每个测试只测试一个功能
3. **独立测试**：测试之间不相互依赖
4. **快速执行**：测试应该快速运行
5. **可读性**：测试代码应该易于理解
6. **覆盖率**：追求合理的测试覆盖率

## 示例测试文件

查看 `test/unit/example.test.js` 获取完整的测试示例。

## 注意事项

1. 测试文件应该以 `.test.js` 或 `.spec.js` 结尾
2. 避免在测试中修改全局状态
3. 及时清理测试资源
4. 使用适当的断言方法
5. 保持测试代码的维护性