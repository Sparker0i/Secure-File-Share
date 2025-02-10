// pages/profile.tsx
import { useEffect, useState, useCallback } from 'react';
import api from '../api/axiosConfig';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import withAuth from '../components/withAuth';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import Navbar from '../components/Navbar';

const MFA_DISPLAY_DURATION = 300; // Duration in seconds (300s = 5 minutes)

function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [mfaMethod, setMfaMethod] = useState<'TOTP' | 'SMS'>('TOTP');
  const [phoneNumber, setPhoneNumber] = useState('');
  // State to hold the MFA setup response data
  const [mfaSetupData, setMfaSetupData] = useState<{ qr_code_url: string; secret: string } | null>(null);
  // Countdown timer (in seconds) to hide the MFA setup data
  const [countdown, setCountdown] = useState<number>(MFA_DISPLAY_DURATION);
  // State to hold the MFA code that the user enters for confirmation
  const [mfaCodeInput, setMfaCodeInput] = useState('');

  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await api.get(
          '/api/auth/profile/',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProfile(response.data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchProfile();
  }, [token]);

  // Effect to run a countdown timer when mfaSetupData is present.
  useEffect(() => {
    if (mfaSetupData) {
      setCountdown(MFA_DISPLAY_DURATION);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setMfaSetupData(null); // Hide MFA setup data after the countdown ends
            return MFA_DISPLAY_DURATION;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [mfaSetupData]);

  // Function to call the MFA setup endpoint and update state with the response
  const initiateMFASetup = useCallback(async () => {
    try {
      const payload: any = { method: mfaMethod };
      if (mfaMethod === 'SMS') {
        payload.phone_number = phoneNumber;
      }
      const response = await api.post(
        '/api/auth/mfa/setup/',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Expecting a response with qr_code_url and secret for TOTP
      setMfaSetupData({
        qr_code_url: response.data.qr_code_url,
        secret: response.data.secret,
      });
      alert('MFA setup initiated. Please scan the QR code below with your authenticator app.');
    } catch (error) {
      console.error(error);
      alert('Failed to enable MFA');
    }
  }, [mfaMethod, phoneNumber, token]);

  // Function to confirm MFA setup using the code entered by the user.
  const confirmMFASetup = async () => {
    try {
      const response = await api.post(
        '/api/auth/mfa/confirm/',
        { mfa_code: mfaCodeInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.message || 'MFA has been enabled in your profile.');
      // Optionally refresh profile or update local state here.
    } catch (error) {
      console.error(error);
      alert('MFA confirmation failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto p-4">
        {profile ? (
          <motion.div 
            className="bg-white p-6 rounded shadow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-2xl font-bold mb-4">Profile</h2>
            <p><strong>Username:</strong> {profile.username}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Role:</strong> {profile.role}</p>
            <p><strong>MFA Enabled:</strong> {profile.mfa_enabled ? 'Yes' : 'No'}</p>
            
            <hr className="my-4" />
            <h3 className="text-xl font-bold mb-2">MFA Settings</h3>
            <div className="mb-4">
              <label className="mr-2">Method:</label>
              <select 
                value={mfaMethod} 
                onChange={(e) => setMfaMethod(e.target.value as 'TOTP' | 'SMS')}
                className="border p-1 rounded"
              >
                <option value="TOTP">TOTP (Authenticator App)</option>
                <option value="SMS">SMS</option>
              </select>
            </div>
            {mfaMethod === 'SMS' && (
              <div className="mb-4">
                <label className="mr-2">Phone Number:</label>
                <input 
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="border p-1 rounded"
                />
              </div>
            )}
            <button onClick={initiateMFASetup} className="bg-blue-600 text-white px-4 py-2 rounded mb-4">
              Enable MFA
            </button>

            {/* MFA Setup Display Section */}
            {mfaSetupData && (
              <div className="mt-6 border p-4 rounded bg-gray-50">
                <h4 className="font-bold mb-2">MFA Setup Details</h4>
                <p className="mb-2">Please scan the QR code with your authenticator app. The QR code will disappear in {countdown} seconds.</p>
                <div className="mb-2">
                  <QRCodeSVG value={mfaSetupData.qr_code_url} size={200} />
                </div>
                <p className="mb-2">
                  If you cannot scan the QR code, you can manually enter the secret:
                  <span className="font-mono bg-gray-200 px-2 py-1 rounded ml-2">{mfaSetupData.secret}</span>
                </p>
                <div className="mb-4">
                  <label className="mr-2">Enter MFA Code:</label>
                  <input 
                    type="text" 
                    value={mfaCodeInput}
                    onChange={(e) => setMfaCodeInput(e.target.value)}
                    className="border p-1 rounded"
                    placeholder="Enter code from authenticator app"
                  />
                </div>
                <div className="flex space-x-4">
                  <button onClick={confirmMFASetup} className="bg-green-600 text-white px-4 py-2 rounded">
                    Confirm MFA Setup
                  </button>
                  <button onClick={initiateMFASetup} className="bg-blue-600 text-white px-4 py-2 rounded">
                    Regenerate QR Code
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <p>Loading profile...</p>
        )}
      </div>
    </div>
  );
}

export default withAuth(Profile);
