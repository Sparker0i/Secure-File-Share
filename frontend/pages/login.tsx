// pages/login.tsx
import { useState } from 'react';
import api from '../api/axiosConfig';
import { useDispatch } from 'react-redux';
import { setAuthData } from '../store/slices/authSlice';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const encryptedPassword = btoa(password);
      const response = await api.post(
        '/api/auth/login/',
        {
          username,
          encrypted_password: encryptedPassword,
        }
      );
      if (response.data.mfa_required) {
        // Redirect to MFA verification page with the temp token
        router.push({
          pathname: '/mfa-verify',
          query: { temp_token: response.data.temp_token }
        });
      } else {
        dispatch(setAuthData({
          user: response.data.user,
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token,
        }));
        router.push('/dashboard');
      }
    } catch (error) {
      console.error(error);
      alert('Login failed');
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
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <input 
          type="text" 
          placeholder="Username or Email" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 mb-4 border rounded"
          required
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 border rounded"
          required
        />
        <motion.button 
          type="submit"
          whileHover={{ scale: 1.05 }}
          className="w-full bg-blue-600 text-white p-3 rounded"
        >
          Login
        </motion.button>
        <p className="mt-4 text-center">
          Don't have an account? <Link href="/register"><a className="text-blue-600">Register</a></Link>
        </p>
      </motion.form>
    </div>
  );
}
