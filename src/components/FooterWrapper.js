'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function FooterWrapper() {
  const pathname = usePathname();
  
  // Check if current route starts with '/admin'
  const isAdminRoute = pathname?.startsWith('/admin');

  // If it's an admin route, do not render the footer
  if (isAdminRoute) return null;

  return <Footer />;
}
