// components/ShareModal.tsx
import { useState } from 'react';
import api from '../api/axiosConfig';
import AsyncSelect from 'react-select/async';
import ShareableLinkModal from './ShareableLinkModal';

interface ShareModalProps {
  fileId: string
  onClose: () => void
  onShared: (shareInfo: any) => void
}

interface OptionType {
  label: string
  value: number
}

export default function ShareModal({ fileId, onClose, onShared }: ShareModalProps) {
  const [shareType, setShareType] = useState<"user" | "link">("user")
  const [target, setTarget] = useState<number | null>(null)
  const [permission, setPermission] = useState<"download">("download")
  const [expiresIn, setExpiresIn] = useState("1440") // default to 1440 minutes = 24 hours
  const [shareLinkData, setShareLinkData] = useState<{ linkId: string; expiresAt: string } | null>(null);

  // Function to load user options based on input
  const loadUserOptions = async (inputValue: string) => {
    try {
      const response = await api.get(
        `/api/auth/users/search/?query=${inputValue}`
      );
      return response.data.map((user: any) => ({
        label: `${user.username} (${user.email})`,
        value: user.id,
      }));
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const handleShare = async () => {
    try {
      const payload: any = { share_type: shareType, permission };
      if (shareType === 'user') {
        if (!target) {
          alert('Please select a user to share with.');
          return;
        }
        payload.target = target;
      } else if (shareType === 'link') {
        payload.expires_in = expiresIn;
      }
      const response = await api.post(
        `/api/files/${fileId}/share/`,
        payload
      );
      if (shareType === 'user') {
        onShared(response.data);
        onClose();
      } else if (shareType === 'link') {
        // Extract the link id from the backend response.
        // For example, if response.data.shareable_link is "/api/files/shareable/abc123"
        const backendLink: string = response.data.shareable_link;
        const parts = backendLink.split('/');
        const linkId = parts[parts.length - 1]; // e.g., "abc123"
        setShareLinkData({
          linkId,
          expiresAt: response.data.expires_at,
        });
      }
    } catch (error) {
      console.error(error);
      alert('File sharing failed');
    }
  };

  return (
    <>
      {!shareLinkData && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Share File</h2>
            <div className="mb-4">
              <label className="mr-2">Share Type:</label>
              <select
                value={shareType}
                onChange={(e) => setShareType(e.target.value as 'user' | 'link')}
              >
                <option value="user">Specific User</option>
                <option value="link">Shareable Link</option>
              </select>
            </div>
            {shareType === 'user' ? (
              <div className="mb-4">
                <label className="mr-2 block">User Identifier:</label>
                <AsyncSelect
                  cacheOptions
                  loadOptions={loadUserOptions}
                  onChange={(selectedOption: OptionType | null) => {
                    if (selectedOption) setTarget(selectedOption.value);
                  }}
                  placeholder="Type a username or email..."
                  defaultOptions
                />
              </div>
            ) : (
              <div className="mb-4">
                <label className="mr-2">Expiration (minutes):</label>
                <input
                  type="number"
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                  className="border p-1 rounded w-full"
                />
              </div>
            )}
            <div className="mb-4">
              <label className="mr-2">Permission:</label>
              <select
                value={permission}
                onChange={(e) => setPermission(e.target.value as 'download')}
              >
                <option value="download">Download</option>
              </select>
            </div>
            <div className="flex justify-end space-x-4">
              <button onClick={onClose} className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button onClick={handleShare} className="px-4 py-2 bg-blue-600 text-white rounded">
                Share
              </button>
            </div>
          </div>
        </div>
      )}
      {shareLinkData && (
        <ShareableLinkModal
          linkId={shareLinkData.linkId}
          expiresAt={shareLinkData.expiresAt}
          onClose={() => {
            setShareLinkData(null);
            onClose();
          }}
        />
      )}
    </>
  );
}
