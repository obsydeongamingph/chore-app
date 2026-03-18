import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { ChoresProvider } from '@/components/providers/ChoresProvider'
import { AppShell } from '@/components/layout/AppShell'
import { Toaster } from '@/components/ui/sonner'

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'ChoreApp — Personal Chore Tracker',
  description: 'Track, schedule, and conquer your household chores with streaks and XP.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${geist.variable} font-sans antialiased`}>
        <ChoresProvider>
          <AppShell>{children}</AppShell>
          <Toaster richColors position="bottom-right" />
        </ChoresProvider>
      </body>
    </html>
  )
}
