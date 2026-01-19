import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}