// src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import StripInjectedAttrs from '../components/StripInjectedAttrs';

export const metadata: Metadata = {
  title: 'the flex.',
  description: 'Property details + reviews',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#FAF7EF] text-neutral-900 antialiased">
        <StripInjectedAttrs />
        <Header />
        <main className="mx-auto max-w-[1120px] px-4 md:px-6 lg:px-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
