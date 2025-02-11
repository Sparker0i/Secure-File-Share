import Link from "next/link"
import { motion } from "framer-motion"
import { useRouter } from "next/router"
import { useSelector, useDispatch } from "react-redux"
import { logout } from "../store/slices/authSlice"
import type { RootState } from "../store"
import { FiUpload, FiUser, FiLogOut } from "react-icons/fi"

export default function Navbar() {
  const router = useRouter()
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.auth.user)

  const handleLogout = () => {
    dispatch(logout())
    router.push("/login")
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: FiUpload },
    { href: "/profile", label: "Profile", icon: FiUser },
  ]

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
              SecureShare
            </span>
          </Link>

          {user && (
            <div className="flex items-center space-x-4">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 
                    ${
                      router.pathname === item.href
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                    }`}>
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <FiLogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  )
}