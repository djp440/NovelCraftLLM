// 示例单元测试文件
// 展示如何编写测试用例

describe('示例测试套件', () => {
    // 测试前执行
    beforeEach(() => {
        console.log('准备测试环境...');
    });

    // 测试后执行
    afterEach(() => {
        console.log('清理测试环境...');
    });

    test('基础数学运算测试', () => {
        // 断言测试
        expect(1 + 1).toBe(2);
        expect(2 * 3).toBe(6);
        expect(10 / 2).toBe(5);
    });

    test('字符串操作测试', () => {
        const str = 'Hello, World!';

        expect(str).toBeDefined();
        expect(str).toContain('Hello');
        expect(str.length).toBe(13);
    });

    test('异步操作测试', async () => {
        const fetchData = () => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({ data: 'test data' });
                }, 100);
            });
        };

        const result = await fetchData();
        expect(result.data).toBe('test data');
    });

    test('错误处理测试', () => {
        // 测试抛出错误
        expect(() => {
            throw new Error('测试错误');
        }).toThrow('测试错误');
    });
});

// 工具函数测试示例
describe('工具函数测试', () => {
    const utils = {
        add: (a, b) => a + b,
        multiply: (a, b) => a * b,
        divide: (a, b) => a / b,
    };

    test('加法函数', () => {
        expect(utils.add(2, 3)).toBe(5);
        expect(utils.add(-1, 1)).toBe(0);
        expect(utils.add(0, 0)).toBe(0);
    });

    test('乘法函数', () => {
        expect(utils.multiply(2, 3)).toBe(6);
        expect(utils.multiply(0, 5)).toBe(0);
        expect(utils.multiply(-2, 3)).toBe(-6);
    });

    test('除法函数', () => {
        expect(utils.divide(6, 2)).toBe(3);
        expect(utils.divide(10, 5)).toBe(2);
        expect(() => utils.divide(5, 0)).toThrow();
    });
});