'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        // Duration of toasts
        duration: 3000,
        // Premium glassmorphism styles matching the site theme
        style: {
          background: 'var(--card-bg)',
          color: 'var(--fg-primary)',
          border: '1px solid var(--border-color)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '12px 18px',
          fontSize: '13px',
          fontWeight: '500',
          boxShadow: 'var(--glow-shadow), 0 10px 30px -10px rgba(0, 0, 0, 0.15)',
        },
        success: {
          iconTheme: {
            primary: 'rgb(16 185 129)', // Emerald 500
            secondary: 'var(--card-bg)',
          },
        },
        error: {
          iconTheme: {
            primary: 'rgb(239 68 68)', // Red 500
            secondary: 'var(--card-bg)',
          },
          duration: 4000,
        },
      }}
    />
  );
}
