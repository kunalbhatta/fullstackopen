import Link from 'next/link'
import type { Metadata } from 'next'
import { auth } from '@/auth'
import { logoutUser } from './actions'
import { Notifications } from '@/components/Notifications'
import './globals.css'
export const metadata: Metadata = {
  title: { default: 'Blog Ledger — Full Stack Open', template: '%s | Blog Ledger' },
  description: 'Next.js blog list built with server components, Drizzle, authentication and reading lists.',
}
export default async function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  const session = await auth()
  return <html lang="en"><body className="min-h-screen bg-slate-50 text-slate-900">
    <Notifications>
      <header className="border-b bg-white shadow-sm"><nav aria-label="Main"
        className="mx-auto flex max-w-5xl flex-wrap items-center gap-5 px-5 py-4">
        <Link href="/" className="mr-auto text-xl font-extrabold tracking-tight text-blue-800">Blog Ledger</Link>
        <Link href="/blogs" className="nav-link">blogs</Link>
        <Link href="/users" className="nav-link">users</Link>
        {session?.user ? <>
          <Link href="/blogs/new" className="nav-link">create</Link>
          <Link href="/me" className="nav-link">me</Link>
          <form action={logoutUser}><button type="submit" className="nav-link">logout</button></form>
        </> : <>
          <Link href="/login" className="nav-link">login</Link>
          <Link href="/register" className="nav-link">register</Link>
        </>}
      </nav></header>
      <main className="mx-auto max-w-5xl px-5 py-10">{children}</main>
      <footer className="mx-auto max-w-5xl border-t px-5 py-5 text-sm text-slate-500">
        Full Stack Open · Next.js learning project
      </footer>
    </Notifications>
  </body></html>
}
