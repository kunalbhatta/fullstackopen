import Link from 'next/link'
export default function NotFound() {
  return <div className="panel"><h1 className="text-3xl font-bold">Not found</h1>
    <p className="my-3">The requested resource does not exist.</p>
    <Link href="/blogs" className="text-blue-700 underline">Return to blogs</Link></div>
}
