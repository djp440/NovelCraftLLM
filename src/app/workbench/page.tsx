/**
 * 工作台页面 - 受保护路由
 * 需要有效的JWT令牌才能访问
 */

export default function WorkbenchPage() {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">NovelCraft 工作台</h1>
                    <p className="text-gray-600 mt-2">欢迎使用小说创作工作台，这里提供完整的创作工具链</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 项目概览卡片 */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">项目概览</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">进行中项目</span>
                                <span className="font-medium">3</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">已完成章节</span>
                                <span className="font-medium">42</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">总字数</span>
                                <span className="font-medium">15,678</span>
                            </div>
                        </div>
                    </div>

                    {/* 快速操作卡片 */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">快速操作</h2>
                        <div className="space-y-3">
                            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
                                新建项目
                            </button>
                            <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition">
                                继续创作
                            </button>
                            <button className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition">
                                管理角色
                            </button>
                        </div>
                    </div>

                    {/* 最近活动卡片 */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">最近活动</h2>
                        <div className="space-y-3">
                            <div className="border-l-4 border-blue-500 pl-3">
                                <p className="text-sm text-gray-700">刚刚更新了《星辰之旅》第5章</p>
                                <p className="text-xs text-gray-500">10分钟前</p>
                            </div>
                            <div className="border-l-4 border-green-500 pl-3">
                                <p className="text-sm text-gray-700">创建了新角色"艾琳娜"</p>
                                <p className="text-xs text-gray-500">2小时前</p>
                            </div>
                            <div className="border-l-4 border-purple-500 pl-3">
                                <p className="text-sm text-gray-700">完成了世界书背景设定</p>
                                <p className="text-xs text-gray-500">昨天</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 主要工作区 */}
                <div className="mt-8 bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">我的项目</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        项目名称
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        状态
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        章节数
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        字数
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        最后更新
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        操作
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">星辰之旅</div>
                                        <div className="text-sm text-gray-500">科幻冒险</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            进行中
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">12</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">8,456</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2024-01-26</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button className="text-blue-600 hover:text-blue-900 mr-3">编辑</button>
                                        <button className="text-green-600 hover:text-green-900">继续</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">暗影之城</div>
                                        <div className="text-sm text-gray-500">都市奇幻</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                            暂停中
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">7</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">4,321</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2024-01-15</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button className="text-blue-600 hover:text-blue-900 mr-3">编辑</button>
                                        <button className="text-green-600 hover:text-green-900">继续</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">时光之河</div>
                                        <div className="text-sm text-gray-500">历史穿越</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            规划中
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2,901</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2024-01-20</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button className="text-blue-600 hover:text-blue-900 mr-3">编辑</button>
                                        <button className="text-green-600 hover:text-green-900">继续</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 安全提示 */}
                <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">安全访问</h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <p>此页面受JWT令牌保护，只有认证用户才能访问。您的会话信息已通过middleware验证。</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}