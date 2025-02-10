// pages/mfa-verify.tsx
import { useState } from 'react';
import api from '../api/axiosConfig';
import { useDispatch } from 'react-redux';
import { setAuthData } from '../store/slices/authSlice';
import { useRouter } from 'next/router';
import { useRouter as useNextRouter } from 'next/router';
import { motion } from 'framer-motion';

export default function MFAVerify() {
  const [mfaCode, setMfaCode] = useState('');
  const dispatch = useDispatch();
  const router = useRouter();
  // Get the temp_token from query parameters
  const { temp_token } = router.query;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!temp_token) return;
    try {
      const response = await api.post(
        '/api/auth/mfa/verify/',
        {
          temp_token,
          mfa_code: mfaCode
        }
      );
      dispatch(setAuthData({
        user: response.data.user,
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
      }));
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      alert('MFA Verification failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center">
      <motion.form 
        onSubmit={handleSubmit} 
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">MFA Verification</h2>
        <input 
          type="text" 
          placeholder="Enter MFA Code" 
          value={mfaCode}
          onChange={(e) => setMfaCode(e.target.value)}
          className="w-full p-3 mb-4 border rounded"
          required
        />
        <motion.button 
          type="submit"
          whileHover={{ scale: 1.05 }}
          className="w-full bg-blue-600 text-white p-3 rounded"
        >
          Verify
        </motion.button>
      </motion.form>
    </div>
  );
}
