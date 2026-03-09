import type { Metadata } from 'next'
import { UserProvider } from '@/lib/providers/user-provider'
import { QueryProvider } from '@/lib/providers/query-provider'
import { ThemeProvider } from '@/lib/providers/theme-provider'
import { Toaster } from 'sonner'

import './global.css'

export const metadata: Metadata = {
  title: 'Evonix GRC',
  description: 'AI-native Governance, Risk and Compliance Platform',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="h-full" suppressHydrationWarning>
      <body className={`h-full font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <QueryProvider>
            <UserProvider>{children}</UserProvider>
          </QueryProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
