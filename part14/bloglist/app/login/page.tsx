import type { Metadata } from 'next'
import LoginForm from '@/components/LoginForm'
export const metadata: Metadata = { title: 'Login' }
export default function Login() {
  return <section><h1 className="mb-6 text-3xl font-extrabold">Login</h1><LoginForm /></section>
}
