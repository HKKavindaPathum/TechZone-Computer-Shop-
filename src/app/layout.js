import { Geist } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const geist = Geist({ subsets: ['latin'] });

export const metadata = {
  title: 'TechZone',
  description: 'Best computers and accessories',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Theme flicker prevent කරනවා */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const theme = localStorage.getItem('theme');
              if (theme === 'dark') {
                document.documentElement.classList.add('dark');
              } else if (theme === 'light') {
                document.documentElement.classList.add('light');
              }
            })();
          `
        }}/>
      </head>
      <body className={geist.className}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}