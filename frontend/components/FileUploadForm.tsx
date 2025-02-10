// FileUploadForm.tsx
import { useState } from 'react';
import api from '../api/axiosConfig'; // Import the custom axios instance
import { motion } from 'framer-motion';

export default function FileUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [encryptionKey, setEncryptionKey] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', file.name);
    formData.append('encryption_key', encryptionKey || 'default_client_key');

    try {
      const response = await api.post('/api/files/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('File uploaded successfully!');
    } catch (error) {
      console.error(error);
      alert('File upload failed');
    }
  };

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="bg-white p-6 rounded shadow mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-xl font-bold mb-4">Upload a File</h2>
      <input 
        type="file" 
        onChange={handleFileChange}
        className="mb-4"
        required
      />
      <input 
        type="text" 
        placeholder="Client-side Encryption Key (optional)" 
        value={encryptionKey}
        onChange={(e) => setEncryptionKey(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />
      <motion.button 
        type="submit"
        whileHover={{ scale: 1.05 }}
        className="bg-green-600 text-white p-2 rounded w-full"
      >
        Upload File
      </motion.button>
    </motion.form>
  );
}
