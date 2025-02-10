// components/FileList.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import ShareModal from './ShareModal';

interface File {
  id: string;
  filename: string;
  size: number;
  uploaded_at: string;
}

interface FileListProps {
  files: File[];
}

export default function FileList({ files }: FileListProps) {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [shareInfo, setShareInfo] = useState(null);

  return (
    <div className="mt-6">
      {files.length === 0 ? (
        <p>No files uploaded yet.</p>
      ) : (
        <ul>
          {files.map((file) => (
            <motion.li 
              key={file.id}
              className="p-4 border-b flex justify-between items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div>
                <p className="font-bold">{file.filename}</p>
                <p>Size: {file.size} bytes</p>
                <p>Uploaded at: {new Date(file.uploaded_at).toLocaleString()}</p>
              </div>
              <div className="space-x-4">
                <a 
                  href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/files/${file.id}/download/`} 
                  className="text-blue-600 hover:underline"
                >
                  Download
                </a>
                <button onClick={() => setSelectedFileId(file.id)} className="text-blue-600 hover:underline">
                  Share
                </button>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
      {selectedFileId && (
        <ShareModal 
          fileId={selectedFileId} 
          onClose={() => setSelectedFileId(null)} 
          onShared={(info) => {
            setShareInfo(info);
            // Optionally, update the UI with the new share info.
          }}
        />
      )}
    </div>
  );
}
