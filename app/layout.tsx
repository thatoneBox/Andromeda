import './globals.css'

export const metadata = {
  title: 'Andromeda',
  description: 'Andromeda proxy UI',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
