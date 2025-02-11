import { useState } from "react"
import api from "../api/axiosConfig"
import { useRouter } from "next/router"
import { motion } from "framer-motion"
import Link from "next/link"

export default function Register() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Retrieve server public key
      const publicKeyRes = await api.get("/api/auth/public-key")
      const publicKey = publicKeyRes.data.public_key
      // Encrypt the password (simulate with base64 for demonstration)
      const encryptedPassword = btoa(password)

      const fullUrl = "/api/auth/register/"
      console.log("Full URL:", fullUrl)

      const response = await api.post(fullUrl, {
        username,
        email,
        encrypted_password: encryptedPassword,
      })
      alert("Registration successful!")
      router.push("/login")
    } catch (error) {
      console.error(error)
      alert("Registration failed")
    }
  }

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center">
      <motion.form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 mb-4 border rounded"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 border rounded"
          required
        />
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          className="w-full bg-green-600 text-white p-3 rounded"
        >
          Register
        </motion.button>
        <p className="mt-4 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600">
            Login
          </Link>
        </p>
      </motion.form>
    </div>
  )
}

