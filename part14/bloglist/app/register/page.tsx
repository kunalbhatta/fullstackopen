import type { Metadata } from 'next'
import RegisterForm from '@/components/RegisterForm'
export const metadata: Metadata = { title: 'Register' }
export default function Register() {
  return <section><h1 className="mb-6 text-3xl font-extrabold">Register</h1><RegisterForm /></section>
}
