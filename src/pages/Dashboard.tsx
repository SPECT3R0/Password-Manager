import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePassword } from '../context/PasswordContext';
import { Settings, LogOut, Plus, Key, Globe, User, Trash2 } from 'lucide-react';

export default function Dashboard() {
  const { signOut } = useAuth();
  const { passwords, addPassword, deletePassword } = usePassword();
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPassword, setNewPassword] = useState({
    website: '',
    username: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      setError('Failed to sign out');
    }
  };

  const handleAddPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addPassword(newPassword.website, newPassword.username, newPassword.password);
      setNewPassword({ website: '', username: '', password: '' });
      setShowAddForm(false);
    } catch (err) {
      setError('Failed to add password');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePassword(id);
    } catch (err) {
      setError('Failed to delete password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Key className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              <h1 className="ml-2 text-xl font-bold text-gray-900 dark:text-gray-100">Password Manager</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/settings')}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Settings className="h-6 w-6" />
              </button>
              <button
                onClick={handleSignOut}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-100 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Stored Passwords</h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Password
            </button>
          </div>

          {showAddForm && (
            <div className="mb-6 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <form onSubmit={handleAddPassword} className="space-y-4">
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Website
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      id="website"
                      required
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      value={newPassword.website}
                      onChange={(e) => setNewPassword({ ...newPassword, website: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Username
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      id="username"
                      required
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      value={newPassword.username}
                      onChange={(e) => setNewPassword({ ...newPassword, username: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="password"
                      id="password"
                      required
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      value={newPassword.password}
                      onChange={(e) => setNewPassword({ ...newPassword, password: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {passwords.map((password) => (
                <li key={password.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{password.website}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{password.username}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(password.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </li>
              ))}
              {passwords.length === 0 && (
                <li className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No passwords stored yet
                </li>
              )}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}