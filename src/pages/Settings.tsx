import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Moon, Sun, Shield } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import QRCode from 'qrcode';
import Navbar from '../components/Navbar';

export default function Settings() {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, setup2FA, verify2FA, disable2FA } = useAuth();

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setTwoFactorEnabled(user.two_factor_enabled);
    }
  }, [user]);

  const handleToggle2FA = async () => {
    if (twoFactorEnabled) {
      // Disable 2FA
      setLoading(true);
      try {
        await disable2FA();
        setTwoFactorEnabled(false);
        setError('');
      } catch (err: any) {
        setError(err.message || 'Failed to disable 2FA');
      } finally {
        setLoading(false);
      }
    } else {
      // Enable 2FA
      setLoading(true);
      try {
        const qrCode = await setup2FA();
        setQrCodeUrl(qrCode);
        setShow2FASetup(true);
        setError('');
      } catch (err: any) {
        setError(err.message || 'Failed to setup 2FA');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verify2FA(verificationCode);
      setTwoFactorEnabled(true);
      setShow2FASetup(false);
      setVerificationCode('');
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to verify 2FA code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </button>

            <div className="mt-6 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">Settings</h3>

                {error && (
                  <div className="mt-4 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-100 px-4 py-3 rounded relative">
                    {error}
                  </div>
                )}

                <div className="mt-6 space-y-6">
                  {/* Theme Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {isDarkMode ? (
                        <Moon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Sun className="h-5 w-5 text-gray-400" />
                      )}
                      <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Dark Mode
                      </span>
                    </div>
                    <button
                      onClick={toggleDarkMode}
                      className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 bg-gray-200 dark:bg-indigo-600"
                      role="switch"
                      aria-checked={isDarkMode}
                    >
                      <span
                        className={`${
                          isDarkMode ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      >
                        <span
                          className={`${
                            isDarkMode ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in'
                          } absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
                          aria-hidden="true"
                        >
                          <Sun className="h-3 w-3 text-gray-400" />
                        </span>
                        <span
                          className={`${
                            isDarkMode ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out'
                          } absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
                          aria-hidden="true"
                        >
                          <Moon className="h-3 w-3 text-indigo-600" />
                        </span>
                      </span>
                    </button>
                  </div>

                  {/* 2FA Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-gray-400" />
                      <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Two-Factor Authentication
                      </span>
                    </div>
                    <button
                      onClick={handleToggle2FA}
                      disabled={loading}
                      className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 bg-gray-200 dark:bg-indigo-600"
                      role="switch"
                      aria-checked={twoFactorEnabled}
                    >
                      <span
                        className={`${
                          twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </button>
                  </div>

                  {/* 2FA Setup */}
                  {show2FASetup && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
                        Scan this QR code with your authenticator app
                      </h4>
                      {qrCodeUrl && (
                        <div className="flex justify-center mb-4">
                          <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                        </div>
                      )}
                      <form onSubmit={handleVerify2FA} className="space-y-4">
                        <div>
                          <label htmlFor="verification-code" className="sr-only">
                            Verification Code
                          </label>
                          <input
                            type="text"
                            id="verification-code"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            placeholder="Enter verification code"
                            required
                          />
                        </div>
                        <div className="flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={() => setShow2FASetup(false)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            {loading ? 'Verifying...' : 'Verify'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}