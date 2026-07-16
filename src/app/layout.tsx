import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider, THEME_INIT_SCRIPT } from '@/components/theme/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: { default: 'EdosPoa – Smart POS for Kenyan Businesses', template: '%s | EdosPoa' },
  description: 'Multi-tenant cloud POS platform with M-Pesa integration, inventory management, and powerful analytics for Kenyan businesses.',
  keywords: ['POS', 'Kenya', 'M-Pesa', 'point of sale', 'inventory', 'retail'],
  metadataBase: new URL(`https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'edos.co.ke'}`),
  openGraph: {
    type: 'website',
    siteName: 'EdosPoa',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { borderRadius: '8px', fontSize: '14px' },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
