import './globals.css'
import AuthWrapper from '@/components/AuthWrapper';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'EduFlow LMS',
  description: 'Next-Generation Learning Management System',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthWrapper>
          {children}
        </AuthWrapper>
        <Toaster 
          position="top-right" 
          richColors 
          closeButton 
          expand={true}
          duration={4000}
        />
      </body>
    </html>
  )
}