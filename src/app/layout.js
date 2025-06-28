import './globals.css'

export const metadata = {
  title: 'Scratch Clone - Visual Code Editor',
  description: 'A visual programming environment like MIT Scratch',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100">{children}</body>
    </html>
  )
}