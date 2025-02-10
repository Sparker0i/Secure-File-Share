import { useEffect, useState } from "react"
import api from "../api/axiosConfig"
import { motion } from "framer-motion"
import Navbar from "../components/Navbar"
import FileList from "../components/FileList"
import FileUploadForm from "../components/FileUploadForm"
import withAuth from "../components/withAuth"
import { FiUpload, FiList } from "react-icons/fi"

function Dashboard() {
  const [files, setFiles] = useState([])
  const [activeTab, setActiveTab] = useState("upload")

  const fetchFiles = async () => {
    try {
      const response = await api.get("/api/files")
      setFiles(response.data)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-16">
        <motion.h1
          className="text-3xl font-bold mb-6 text-gray-800"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Dashboard
        </motion.h1>

        <div className="mb-6">
          <div className="flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab("upload")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors duration-200
                ${activeTab === "upload" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"}`}
            >
              <FiUpload />
              <span>Upload</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab("files")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors duration-200
                ${activeTab === "files" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"}`}
            >
              <FiList />
              <span>Your Files</span>
            </motion.button>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {activeTab === "upload" ? <FileUploadForm onUploadSuccess={fetchFiles}/> : <FileList files={files} />}
        </motion.div>
      </div>
    </div>
  )
}

export default withAuth(Dashboard)

