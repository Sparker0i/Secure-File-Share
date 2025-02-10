import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <motion.h1 
        className="text-5xl font-bold mb-8"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Secure File Share
      </motion.h1>
      <div className="space-x-4">
        <Link href="/login">
          <a className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Login</a>
        </Link>
        <Link href="/register">
          <a className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition">Register</a>
        </Link>
      </div>
    </div>
  )
}
