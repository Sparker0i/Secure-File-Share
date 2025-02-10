import { useEffect, useState } from 'react'
import api from '../api/axiosConfig';
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import FileList from '../components/FileList'
import FileUploadForm from '../components/FileUploadForm'
import withAuth from '../components/withAuth';

function Dashboard() {
  const [files, setFiles] = useState([])

  useEffect(() => {
    async function fetchFiles() {
      try {
        const response = await api.get('/api/files')
        setFiles(response.data)
      } catch (error) {
        console.error(error)
      }
    }
    fetchFiles()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto p-4">
        <motion.h1 
          className="text-3xl font-bold mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          Your Files
        </motion.h1>
        <FileUploadForm />
        <FileList files={files} />
      </div>
    </div>
  )
}

export default withAuth(Dashboard);