import './globals.css'

export const metadata = {
  title: 'The 10,000 Breaths Project',
  description:
    'A 12-week citizen experiment to understand how Delhi NCR experiences air pollution and what could move us from knowing to agency to participation.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
