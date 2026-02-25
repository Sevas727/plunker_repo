import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { Metadata } from 'next';
import Navbar from '@/app/ui/navbar';
import { WebVitals } from '@/app/ui/web-vitals';
import CursorGlow from '@/app/ui/cursor-glow';

export const metadata: Metadata = {
  title: {
    template: '%s | Fedotov Vsevolod',
    default: 'Fedotov Vsevolod',
  },
  description: 'Full-stack portfolio and dashboard application by Fedotov Vsevolod.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} relative text-gray-100 antialiased`}>
        {/* Background layer (lowest) */}
        <div className="fixed inset-0 -z-20 bg-black" />
        {/* Cursor glow layer (between bg and content) */}
        <CursorGlow />
        <WebVitals />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
