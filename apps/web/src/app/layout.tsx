import './globals.css'
import AuthWrapper from '@/components/AuthWrapper';

export const metadata = {
  title: 'EduFlow LMS',
  description: 'Next-Generation Learning Management System',
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
      </body>
    </html>
  )
}