import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import ShareModal from "./ShareModal"
import api from "../api/axiosConfig"
import { FiDownload, FiShare2, FiFile, FiClock, FiHardDrive } from "react-icons/fi"
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface File {
  id: string
  filename: string
  size: number
  uploaded_at: string
}

interface FileListProps {
  files: File[]
}

export default function FileList({ files }: FileListProps) {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  const handleDownload = async (fileId: string, filename: string) => {
    try {
      const response = await api.get(
        `/api/files/${fileId}/download/`,
        {
          responseType: 'blob', // Important for binary data
        }
      );
      // Create a URL for the blob data
      const url = window.URL.createObjectURL(new Blob([response.data]));
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename); // Set the file name for download
      document.body.appendChild(link);
      link.click();
      // Clean up and remove the link
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error(error);
      alert('Download failed');
    }
  };

  return (
    <AnimatePresence>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        {files.length === 0 ? (
          <motion.div variants={item} className="text-center py-16 glass-card">
            <FiFile className="w-20 h-20 mx-auto mb-6 text-slate-400 animate-float" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No files uploaded yet</h3>
            <p className="text-slate-500">Drop files here or use the upload button to get started</p>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {files.map((file) => (
              <motion.div key={file.id} variants={item} className="file-item group" whileHover={{ scale: 1.01 }}>
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                    <FiFile className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1">{file.filename}</h3>
                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      <div className="flex items-center">
                        <FiHardDrive className="w-4 h-4 mr-1" />
                        {formatFileSize(file.size)}
                      </div>
                      <div className="flex items-center">
                        <FiClock className="w-4 h-4 mr-1" />
                        {new Date(file.uploaded_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-xl hover:bg-blue-50 text-blue-600 tooltip-trigger"
                    onClick={() => handleDownload(file.id, file.filename)}

                  >
                    <FiDownload className="w-5 h-5" />
                    <span className="tooltip">Download</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-xl hover:bg-green-50 text-green-600 tooltip-trigger"
                    onClick={() => setSelectedFileId(file.id)}
                  >
                    <FiShare2 className="w-5 h-5" />
                    <span className="tooltip">Share</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {selectedFileId && (
        <ShareModal
          fileId={selectedFileId}
          onClose={() => setSelectedFileId(null)}
          onShared={() => {
            setSelectedFileId(null)
          }}
        />
      )}
    </AnimatePresence>
  )
}

