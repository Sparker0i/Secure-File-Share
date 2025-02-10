import { motion } from "framer-motion"
import Link from "next/link"
import { FiLock, FiShare2, FiShield, FiArrowRight } from "react-icons/fi"

export default function Home() {
  const features = [
    {
      icon: <FiLock />,
      title: "End-to-End Encryption",
      description: "Military-grade encryption ensures your files remain private and secure.",
    },
    {
      icon: <FiShare2 />,
      title: "Smart Sharing",
      description: "Share files securely with customizable access controls and expiration.",
    },
    {
      icon: <FiShield />,
      title: "Advanced Security",
      description: "Multi-factor authentication and real-time activity monitoring.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/50">
      <div className="relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          {/* Hero Section */}
          <div className="pt-32 pb-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto"
            >
              <h1 className="text-6xl md:text-7xl font-bold mb-8 gradient-text">
                Secure File Sharing
                <br />
                Reimagined
              </h1>

              <p className="text-xl text-slate-600 mb-12 leading-relaxed">
                Experience the next generation of secure file sharing with military-grade encryption, intuitive
                controls, and unmatched security features.
              </p>

              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Link href="/login">
                  <a className="btn-primary group">
                    Get Started
                    <FiArrowRight className="inline-block ml-2 transform group-hover:translate-x-1 transition-transform" />
                  </a>
                </Link>
                <Link href="/register">
                  <a className="btn-secondary">Create Free Account</a>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="py-20"
          >
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4 gradient-text">Why Choose SecureShare?</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Built with security at its core, SecureShare provides enterprise-grade features in an intuitive package.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.2 }}
                  className="feature-card"
                  whileHover={{ y: -8 }}
                >
                  <div className="feature-icon">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Trust Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="py-20 text-center"
          >
            <div className="glass-card max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold mb-6 gradient-text">Trusted by Industry Leaders</h2>
              <p className="text-slate-600 mb-8">
                Join thousands of companies who trust SecureShare with their sensitive data. Enterprise-grade security
                meets unmatched simplicity.
              </p>
              <Link href="/register">
                <a className="btn-accent">Start Secure File Sharing</a>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

