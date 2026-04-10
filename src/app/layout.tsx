// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import AuthProvider from '@/components/AuthProvider';
import { ToastContainer } from 'react-toastify';

export const metadata: Metadata = {
  title: 'SmartTeach',
  description: 'AI-powered academic support system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <AuthProvider>
          <div className="min-h-screen">{children}</div>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            toastStyle={{
              borderRadius: '16px',
              fontWeight: 600,
              fontSize: '0.875rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}