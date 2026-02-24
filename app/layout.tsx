import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { Metadata } from 'next';
import Navbar from '@/app/ui/navbar';
import { WebVitals } from '@/app/ui/web-vitals';

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
      <body className={`${inter.className} antialiased`}>
        <WebVitals />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
