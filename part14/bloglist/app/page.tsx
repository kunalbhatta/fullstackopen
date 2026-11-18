import type { Metadata } from 'next'
import HomeContent from './homepage.mdx'
export const metadata: Metadata = { title: 'Home' }
export default function Home() {
  return <div className="panel markdown"><HomeContent /></div>
}
