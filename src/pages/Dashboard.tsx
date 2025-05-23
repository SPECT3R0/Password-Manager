import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePassword } from '../context/PasswordContext';
import { Settings, LogOut, Plus, Key, Globe, User, Trash2, Eye, EyeOff, ShieldCheck, FolderOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';

type PasswordInput = {
  website: string;
  username: string;
  password: string;
};

const dummyPasswords = [
  {
    id: 'dummy1',
    website: 'https://www.facebook.com',
    username: 'john.doe',
    encrypted_password: 'fb@1234!A',
  },
  {
    id: 'dummy2',
    website: 'https://www.amazon.com',
    username: 'jane.smith',
    encrypted_password: 'amz$Pass9',
  },
  {
    id: 'dummy3',
    website: 'https://www.gmail.com',
    username: 'user.email',
    encrypted_password: 'Gmail!2024',
  },
];

export default function Dashboard() {
  const { signOut } = useAuth();
  const { passwords, addPassword, deletePassword, getPasswords, loading: passwordsLoading } = usePassword();
  const navigate = useNavigate();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newPassword, setNewPassword] = useState<PasswordInput>({
    website: '',
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());

  useEffect(() => {
    getPasswords().catch((err) => {
      setError('Failed to load passwords');
      console.error('Error loading passwords:', err);
    });
  }, [getPasswords]);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      navigate('/login', { replace: true });
      setError('');
    } catch (err) {
      setError('Failed to sign out');
      console.error('Error signing out:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addPassword({
        website: newPassword.website,
        username: newPassword.username,
        encrypted_password: newPassword.password,
      });
      setNewPassword({ website: '', username: '', password: '' });
      setShowAddForm(false);
      setError('');
    } catch (err) {
      setError('Failed to add password');
      console.error('Error adding password:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await deletePassword(id);
      setError('');
    } catch (err) {
      setError('Failed to delete password');
      console.error('Error deleting password:', err);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const sortedPasswords = [...passwords].sort((a, b) => a.website.localeCompare(b.website));

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-indigo-100 via-white to-indigo-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <motion.h2 initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
              Your Passwords
            </motion.h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center px-5 py-2 border border-transparent text-base font-semibold rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
              disabled={loading || passwordsLoading}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Password
            </motion.button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-100 px-4 py-3 rounded relative"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mb-8 bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8"
              >
                <form onSubmit={handleAddPassword} className="space-y-6">
                  <div>
                    <label htmlFor="website" className="block text-base font-medium text-gray-700 dark:text-gray-300">
                      Website
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        id="website"
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow"
                        value={newPassword.website}
                        onChange={(e) => setNewPassword({ ...newPassword, website: e.target.value })}
                        disabled={loading || passwordsLoading}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="username" className="block text-base font-medium text-gray-700 dark:text-gray-300">
                      Username
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        id="username"
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow"
                        value={newPassword.username}
                        onChange={(e) => setNewPassword({ ...newPassword, username: e.target.value })}
                        disabled={loading || passwordsLoading}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-base font-medium text-gray-700 dark:text-gray-300">
                      Password
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        required
                        className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow"
                        value={newPassword.password}
                        onChange={(e) => setNewPassword({ ...newPassword, password: e.target.value })}
                        disabled={loading || passwordsLoading}
                        aria-label="Password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        title={showPassword ? 'Hide password' : 'Show password'}
                        disabled={loading || passwordsLoading}
                        tabIndex={0}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      disabled={loading || passwordsLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      disabled={loading || passwordsLoading}
                    >
                      {loading ? 'Adding...' : 'Add Password'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-gray-800 shadow-xl overflow-hidden sm:rounded-xl">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {passwordsLoading ? (
                <li className="px-6 py-6 text-center text-gray-500 dark:text-gray-400 animate-pulse">
                  Loading passwords...
                </li>
              ) : sortedPasswords.length === 0 ? (
                <>
                  <motion.li
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="px-6 pt-12 pb-2 flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 animate-fadeIn"
                  >
                    <motion.div
                      initial={{ scale: 0.8, rotate: -10 }}
                      animate={{ scale: [0.8, 1.1, 1], rotate: [0, 10, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                      className="mb-4"
                    >
                      <FolderOpen className="h-16 w-16 text-indigo-300 dark:text-indigo-500" />
                    </motion.div>
                    <span className="text-lg font-semibold">No passwords stored yet.</span>
                    <span className="text-sm mt-2 mb-4">Here are some examples. Click <span className="text-indigo-600 font-bold">Add Password</span> to get started!</span>
                  </motion.li>
                  <AnimatePresence>
                    {dummyPasswords.map((password) => (
                      <motion.li
                        key={password.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                        className="px-6 py-6 hover:bg-indigo-50 dark:hover:bg-gray-900 transition-colors rounded-xl mb-2 flex flex-col gap-2 shadow-sm border border-dashed border-indigo-200 dark:border-indigo-700"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{password.website}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{password.username}</p>
                          </div>
                          <span className="text-xs text-indigo-400 font-semibold">Example</span>
                        </div>
                        <div className="mt-2 flex items-center space-x-2">
                          <span className="text-base font-medium text-gray-900 dark:text-gray-100">
                            {password.encrypted_password}
                          </span>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </>
              ) : (
                <AnimatePresence>
                  {sortedPasswords.map((password) => (
                    <motion.li
                      key={password.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 py-6 hover:bg-indigo-50 dark:hover:bg-gray-900 transition-colors rounded-xl mb-2 flex flex-col gap-2 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{password.website}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{password.username}</p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => handleDelete(password.id)}
                          className="text-red-600 hover:text-red-900 dark:hover:text-red-400 focus:outline-none"
                          disabled={loading || passwordsLoading}
                        >
                          <Trash2 className="h-5 w-5" />
                        </motion.button>
                      </div>
                      <div className="mt-2 flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          type="button"
                          onClick={() => togglePasswordVisibility(password.id)}
                          className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none"
                          aria-label={visiblePasswords.has(password.id) ? 'Hide password' : 'Show password'}
                          title={visiblePasswords.has(password.id) ? 'Hide password' : 'Show password'}
                          disabled={loading || passwordsLoading}
                          tabIndex={0}
                        >
                          {visiblePasswords.has(password.id) ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </motion.button>
                        <span className="text-base font-medium text-gray-900 dark:text-gray-100">
                          {visiblePasswords.has(password.id) ? password.encrypted_password : '••••••••'}
                        </span>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              )}
            </ul>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
