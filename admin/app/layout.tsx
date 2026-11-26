import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ToastProvider } from '@/components/ui/Toast';
import '../styles/global.scss';

export const metadata: Metadata = {
  title: 'Admin panel',
  description: '"Yangi Bekobod" gazetasi boshqaruv paneli',
  // Sayt bilan bir xil favicon to'plami (design/favicon dan, o'zgartirilmagan).
  // Admin panel ichki vosita — PWA manifest kerak emas, faqat ikonkalar.
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uz">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      {/* ToastProvider eng tashqarida — login sahifasi ham, dashboard ham
          bir xil bildirishnoma tizimidan foydalanadi. */}
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
