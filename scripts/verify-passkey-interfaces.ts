/**
 * 验证Passkey接口预留位置脚本
 * 检查所有必要的Passkey接口是否已正确预留
 */

import fs from 'fs';
import path from 'path';

interface VerificationResult {
    file: string;
    exists: boolean;
    hasPasskeyContent: boolean;
    issues: string[];
}

class PasskeyInterfaceVerifier {
    private baseDir: string;

    constructor() {
        this.baseDir = process.cwd();
    }

    /**
     * 验证所有Passkey相关接口
     */
    async verifyAll(): Promise<void> {
        console.log('🔍 开始验证Passkey接口预留位置...\n');

        const results: VerificationResult[] = [];

        // 1. 验证数据库设计
        results.push(await this.verifyDatabaseDesign());

        // 2. 验证用户模型
        results.push(await this.verifyUserModel());

        // 3. 验证Passkey服务类
        results.push(await this.verifyPasskeyService());

        // 4. 验证API端点
        results.push(...await this.verifyApiEndpoints());

        // 5. 验证登录页面
        results.push(await this.verifyLoginPage());

        // 输出验证结果
        this.printResults(results);

        // 总结
        this.printSummary(results);
    }

    /**
     * 验证数据库设计
     */
    private async verifyDatabaseDesign(): Promise<VerificationResult> {
        const filePath = path.join(this.baseDir, 'src/db/migrations/001_create_users_table.sql');
        const result: VerificationResult = {
            file: '数据库迁移文件 (001_create_users_table.sql)',
            exists: false,
            hasPasskeyContent: false,
            issues: []
        };

        try {
            result.exists = fs.existsSync(filePath);
            if (result.exists) {
                const content = fs.readFileSync(filePath, 'utf-8');
                result.hasPasskeyContent = content.includes('passkey_credential');

                if (!result.hasPasskeyContent) {
                    result.issues.push('缺少 passkey_credential 字段');
                }

                // 检查auth_method字段
                if (!content.includes('auth_method')) {
                    result.issues.push('缺少 auth_method 字段');
                }
            } else {
                result.issues.push('文件不存在');
            }
        } catch (error) {
            result.issues.push(`读取文件失败: ${error}`);
        }

        return result;
    }

    /**
     * 验证用户模型
     */
    private async verifyUserModel(): Promise<VerificationResult> {
        const filePath = path.join(this.baseDir, 'src/db/models.ts');
        const result: VerificationResult = {
            file: '用户模型 (src/db/models.ts)',
            exists: false,
            hasPasskeyContent: false,
            issues: []
        };

        try {
            result.exists = fs.existsSync(filePath);
            if (result.exists) {
                const content = fs.readFileSync(filePath, 'utf-8');
                result.hasPasskeyContent =
                    content.includes('updateToPasskeyAuth') ||
                    content.includes('updateToPasswordAuth') ||
                    content.includes('usesPasskeyAuth') ||
                    content.includes('getPasskeyCredential') ||
                    content.includes('findByCredentialId');

                if (!result.hasPasskeyContent) {
                    result.issues.push('缺少Passkey相关方法');
                }
            } else {
                result.issues.push('文件不存在');
            }
        } catch (error) {
            result.issues.push(`读取文件失败: ${error}`);
        }

        return result;
    }

    /**
     * 验证Passkey服务类
     */
    private async verifyPasskeyService(): Promise<VerificationResult> {
        const filePath = path.join(this.baseDir, 'src/auth/passkey.ts');
        const result: VerificationResult = {
            file: 'Passkey服务类 (src/auth/passkey.ts)',
            exists: false,
            hasPasskeyContent: false,
            issues: []
        };

        try {
            result.exists = fs.existsSync(filePath);
            if (result.exists) {
                const content = fs.readFileSync(filePath, 'utf-8');
                result.hasPasskeyContent =
                    content.includes('class PasskeyService') ||
                    content.includes('class PasskeyManager');

                if (!result.hasPasskeyContent) {
                    result.issues.push('缺少Passkey服务类定义');
                }
            } else {
                result.issues.push('文件不存在');
            }
        } catch (error) {
            result.issues.push(`读取文件失败: ${error}`);
        }

        return result;
    }

    /**
     * 验证API端点
     */
    private async verifyApiEndpoints(): Promise<VerificationResult[]> {
        const endpoints = [
            { name: 'Passkey注册API', path: 'src/app/api/auth/passkey/register/route.ts' },
            { name: 'Passkey认证API', path: 'src/app/api/auth/passkey/authenticate/route.ts' },
            { name: 'Passkey状态API', path: 'src/app/api/auth/passkey/status/route.ts' }
        ];

        const results: VerificationResult[] = [];

        for (const endpoint of endpoints) {
            const filePath = path.join(this.baseDir, endpoint.path);
            const result: VerificationResult = {
                file: `${endpoint.name} (${endpoint.path})`,
                exists: false,
                hasPasskeyContent: false,
                issues: []
            };

            try {
                result.exists = fs.existsSync(filePath);
                if (result.exists) {
                    const content = fs.readFileSync(filePath, 'utf-8');
                    result.hasPasskeyContent =
                        content.includes('Passkey') ||
                        content.includes('passkey');

                    if (!result.hasPasskeyContent) {
                        result.issues.push('缺少Passkey相关逻辑');
                    }
                } else {
                    result.issues.push('文件不存在');
                }
            } catch (error) {
                result.issues.push(`读取文件失败: ${error}`);
            }

            results.push(result);
        }

        return results;
    }

    /**
     * 验证登录页面
     */
    private async verifyLoginPage(): Promise<VerificationResult> {
        const filePath = path.join(this.baseDir, 'src/app/login/page.tsx');
        const result: VerificationResult = {
            file: '登录页面 (src/app/login/page.tsx)',
            exists: false,
            hasPasskeyContent: false,
            issues: []
        };

        try {
            result.exists = fs.existsSync(filePath);
            if (result.exists) {
                const content = fs.readFileSync(filePath, 'utf-8');
                result.hasPasskeyContent =
                    content.includes('handlePasskeyLogin') ||
                    content.includes('使用Passkey登录');

                if (!result.hasPasskeyContent) {
                    result.issues.push('缺少Passkey登录选项');
                }
            } else {
                result.issues.push('文件不存在');
            }
        } catch (error) {
            result.issues.push(`读取文件失败: ${error}`);
        }

        return result;
    }

    /**
     * 输出验证结果
     */
    private printResults(results: VerificationResult[]): void {
        for (const result of results) {
            const status = result.exists && result.hasPasskeyContent ? '✅' : '❌';
            console.log(`${status} ${result.file}`);

            if (result.issues.length > 0) {
                result.issues.forEach(issue => {
                    console.log(`   ⚠️  ${issue}`);
                });
            }

            console.log();
        }
    }

    /**
     * 输出总结
     */
    private printSummary(results: VerificationResult[]): void {
        const total = results.length;
        const passed = results.filter(r => r.exists && r.hasPasskeyContent).length;
        const failed = total - passed;

        console.log('📊 验证总结:');
        console.log(`   总计检查: ${total} 个接口`);
        console.log(`   通过: ${passed} 个`);
        console.log(`   失败: ${failed} 个`);
        console.log();

        if (failed === 0) {
            console.log('🎉 所有Passkey接口预留位置验证通过！');
            console.log('✅ 数据库设计已包含 passkey_credential 字段');
            console.log('✅ 用户模型已添加Passkey相关方法');
            console.log('✅ Passkey服务类已创建');
            console.log('✅ API端点已预留');
            console.log('✅ 登录页面已添加Passkey登录选项');
        } else {
            console.log('⚠️  部分接口验证失败，请检查上述问题');
        }
    }
}

// 执行验证
const verifier = new PasskeyInterfaceVerifier();
verifier.verifyAll().catch(console.error);