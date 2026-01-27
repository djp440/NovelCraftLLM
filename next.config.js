/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    experimental: {
        serverActions: true,
    },
    typescript: {
        // 在构建时忽略TypeScript错误
        ignoreBuildErrors: false,
    },
    eslint: {
        // 在构建时忽略ESLint错误
        ignoreDuringBuilds: true,
    },
}

module.exports = nextConfig