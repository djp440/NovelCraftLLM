import './globals.css'

export const metadata = {
  title: 'NovelCraft LLM',
  description: 'AI-powered novel writing assistant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
