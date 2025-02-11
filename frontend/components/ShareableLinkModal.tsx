// components/ShareableLinkModal.tsx
import { useState } from 'react';

interface ShareableLinkModalProps {
  linkId: string;
  expiresAt: string;
  onClose: () => void;
}

export default function ShareableLinkModal({ linkId, expiresAt, onClose }: ShareableLinkModalProps) {
  // Build the frontend URL that the user will see:
  const shareableLink = `${window.location.origin}/share/${linkId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      alert('Link copied to clipboard!');
    } catch (err) {
      alert('Failed to copy link.');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Shareable Link</h2>
        <p className="mb-2">Use the following link to download the file without authentication:</p>
        <div className="mb-2 bg-gray-100 p-2 rounded break-words">
          {shareableLink}
        </div>
        <p className="mb-4 text-sm">Expires at: {new Date(expiresAt).toLocaleString()}</p>
        <div className="flex justify-end space-x-4">
          <button onClick={handleCopy} className="px-4 py-2 bg-blue-600 text-white rounded">
            Copy Link
          </button>
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
