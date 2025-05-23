import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Moon, Sun, Shield } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Settings() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [error, setError] = useState('');

  const handleToggle2FA = async () => {
    try {
      // Toggle 2FA logic here
      setTwoFactorEnabled(!twoFactorEnabled);
    } catch (err) {
      setError('Failed to toggle 2FA');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          </div>

          {error && (
            <div className="mt-4 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-100 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="mt-6 bg-white dark:bg-gray-800 shadow rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {theme === 'dark' ? (
                    <Moon className="h-6 w-6 text-gray-400" />
                  ) : (
                    <Sun className="h-6 w-6 text-gray-400" />
                  )}
                  <span className="ml-3 text-gray-900 dark:text-gray-100">Dark Mode</span>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`${
                    theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-200'
                  } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                  <span className="sr-only">Toggle theme</span>
                  <span
                    className={`${
                      theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                  />
                </button>
              </div>
            </div>

            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className="h-6 w-6 text-gray-400" />
                  <span className="ml-3 text-gray-900 dark:text-gray-100">Two-Factor Authentication</span>
                </div>
                <button
                  onClick={handleToggle2FA}
                  className={`${
                    twoFactorEnabled ? 'bg-indigo-600' : 'bg-gray-200'
                  } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                  <span className="sr-only">Toggle 2FA</span>
                  <span
                    className={`${
                      twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                  />
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Enable two-factor authentication for additional security.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}