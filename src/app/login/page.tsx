/**
 * 登录页面
 * 当用户尝试访问受保护路由但未提供有效JWT时，会被重定向到此页面
 */

'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/workbench';
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // 模拟登录API调用
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (data.success && data.token) {
                // 存储令牌到cookie（实际应用中应该使用httpOnly cookie）
                document.cookie = `token=${data.token}; path=/; max-age=86400`; // 24小时

                // 重定向到原始请求页面或工作台
                window.location.href = redirect;
            } else {
                setError(data.message || '登录失败');
            }
        } catch (err) {
            setError('网络错误，请稍后重试');
            console.error('登录错误:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemoLogin = () => {
        // 演示用：设置一个模拟令牌并重定向
        const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiZGVtb0BleGFtcGxlLmNvbSIsImF1dGhNZXRob2QiOiJwYXNzd29yZCIsImlhdCI6MTcwNjM0NTYwMCwiZXhwIjoxNzA2OTUwNDAwfQ.mock-token-for-demo-only';
        document.cookie = `token=${mockToken}; path=/; max-age=86400`;
        window.location.href = redirect;
    };

    const handlePasskeyLogin = async () => {
        setIsLoading(true);
        setError('');

        try {
            // 检查Passkey支持
            const statusResponse = await fetch('/api/auth/passkey/status');
            const statusData = await statusResponse.json();

            if (!statusData.success || !statusData.data?.supported) {
                setError('当前浏览器不支持Passkey登录');
                setIsLoading(false);
                return;
            }

            // 提示用户输入用户名
            const inputUsername = prompt('请输入您的用户名/邮箱：');
            if (!inputUsername) {
                setIsLoading(false);
                return;
            }

            setUsername(inputUsername);

            // 检查用户是否已注册Passkey
            const authOptionsResponse = await fetch(`/api/auth/passkey/authenticate?username=${encodeURIComponent(inputUsername)}`);
            const authOptionsData = await authOptionsResponse.json();

            if (!authOptionsData.success || !authOptionsData.hasPasskey) {
                setError('该用户未注册Passkey，请使用密码登录或先注册Passkey');
                setIsLoading(false);
                return;
            }

            // 预留接口：未来实现完整的WebAuthn认证流程
            alert('Passkey登录功能预留接口\n\n实际实现中，这里会调用浏览器的WebAuthn API进行生物识别认证。\n\n当前为演示模式，请使用密码登录。');

            // 模拟Passkey登录成功
            const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInVzZXJuYW1lIjoidGVzdEBleGFtcGxlLmNvbSIsImF1dGhNZXRob2QiOiJwYXNza2V5IiwiaWF0IjoxNzA2MzQ1NjAwLCJleHAiOjE3MDY5NTA0MDB9.mock-passkey-token';
            document.cookie = `token=${mockToken}; path=/; max-age=86400`;
            window.location.href = redirect;

        } catch (err) {
            setError('Passkey登录失败，请重试');
            console.error('Passkey登录错误:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        登录到 NovelCraft
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        访问受保护的工作台页面
                        {redirect && redirect !== '/workbench' && (
                            <span className="block text-blue-600 mt-1">
                                您正在尝试访问: {redirect}
                            </span>
                        )}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="username" className="sr-only">
                                用户名/邮箱
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="用户名或邮箱"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                密码
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="密码"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? '登录中...' : '登录'}
                        </button>
                    </div>

                    <div className="text-center space-y-3">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-gray-50 text-gray-500">或</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handlePasskeyLogin}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            使用Passkey登录
                        </button>

                        <button
                            type="button"
                            onClick={handleDemoLogin}
                            className="text-sm text-blue-600 hover:text-blue-500"
                        >
                            使用演示账户登录（测试用）
                        </button>
                    </div>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-gray-50 text-gray-500">关于JWT保护</span>
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                        <p className="mb-2">
                            <strong>此页面演示了Next.js Middleware的JWT保护功能：</strong>
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>访问 <code>/workbench</code> 路由时，middleware会检查JWT令牌</li>
                            <li>如果令牌无效或不存在，会自动重定向到此登录页面</li>
                            <li>登录成功后，令牌会存储在cookie中</li>
                            <li>后续访问受保护路由时，middleware会验证令牌有效性</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}