import Navbar from '../components/Navbar'
import FileUploadForm from '../components/FileUploadForm'

export default function Upload() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Upload File</h1>
        <FileUploadForm />
      </div>
    </div>
  )
}
