import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Navbar() {
  return (
    <nav className="bg-blue-600 p-4">
      <motion.div 
        className="container mx-auto flex justify-between items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Link href="/">
          <a className="text-white text-xl font-bold">Secure File Share</a>
        </Link>
        <div className="space-x-4">
          <Link href="/dashboard">
            <a className="text-white">Dashboard</a>
          </Link>
          <Link href="/upload">
            <a className="text-white">Upload</a>
          </Link>
          <Link href="/profile">
            <a className="text-white">Profile</a>
          </Link>
          <Link href="/login">
            <a className="text-white">Logout</a>
          </Link>
        </div>
      </motion.div>
    </nav>
  )
}
