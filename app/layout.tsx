import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { ConfigProvider } from '@/lib/config-context';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'ROI Staking Calculator - Calculate Your Token Returns',
  description: 'Professional ROI staking calculator with 4-tier system. Calculate your potential returns from token staking investments.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg'
  },
  openGraph: {
    title: 'ROI Staking Calculator',
    description: 'Calculate your potential returns from token staking with our 4-tier system',
    images: ['/og-image.png'],
    type: 'website'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ConfigProvider>
            {children}
            <Toaster position="top-right" richColors />
          </ConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
