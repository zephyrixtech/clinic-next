import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { getServerSession } from 'next-auth'
import { SessionProvider } from '@/components/SessionProvider'
import { seedAdmin } from "@/lib/seed-admin";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'My Clinic App',
  description: 'A modern clinic management system',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}

if (process.env.NODE_ENV === "development") {
  seedAdmin().catch(console.error);
}