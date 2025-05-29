import { useState } from 'react';
import { usePassword } from '../context/PasswordContext';
import { Eye, EyeOff, Copy, Edit2, Trash2, Plus, Globe, User, FileText, Lock as LockIcon } from 'lucide-react';

export function PasswordList() {
  const { state, addPassword, updatePassword, deletePassword } = usePassword();
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});
  const [editingPassword, setEditingPassword] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState({
    title: '',
    username: '',
    password: '',
    website: '',
    notes: '',
  });

  const togglePasswordVisibility = (id: string) => {
    setShowPassword((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const copyToClipboard = (text: string) => {
    // Clear clipboard after 30 seconds
    navigator.clipboard.writeText(text).then(() => {
      setTimeout(() => {
        navigator.clipboard.writeText('');
      }, 30000);
    });
  };

  const handleAddPassword = async () => {
    try {
      await addPassword(newPassword);
      setNewPassword({
        title: '',
        username: '',
        password: '',
        website: '',
        notes: '',
      });
    } catch (error) {
      // Handle error without exposing details
    }
  };

  const handleEditPassword = async (id: string, password: any) => {
    try {
      await updatePassword(id, password);
      setEditingPassword(null);
    } catch (error) {
      // Handle error without exposing details
    }
  };

  const handleDeletePassword = async (id: string) => {
    try {
      await deletePassword(id);
    } catch (error) {
      // Handle error without exposing details
    }
  };

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-center">
        An error occurred. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add New Password Form */}
      <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Plus className="w-5 h-5 mr-2 text-blue-500" />
          Add New Password
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
            <input
              type="text"
              placeholder="Enter title"
              value={newPassword.title}
              onChange={(e) => setNewPassword({ ...newPassword, title: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
            <input
              type="text"
              placeholder="Enter username"
              value={newPassword.username}
              onChange={(e) => setNewPassword({ ...newPassword, username: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={newPassword.password}
              onChange={(e) => setNewPassword({ ...newPassword, password: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Website (optional)</label>
            <input
              type="text"
              placeholder="Enter website URL"
              value={newPassword.website}
              onChange={(e) => setNewPassword({ ...newPassword, website: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes (optional)</label>
            <textarea
              placeholder="Enter any additional notes"
              value={newPassword.notes}
              onChange={(e) => setNewPassword({ ...newPassword, notes: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              rows={3}
            />
          </div>
          <div className="md:col-span-2">
            <button
              onClick={handleAddPassword}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              disabled={state.isLoading}
            >
              <Plus className="w-5 h-5" />
              <span>Add Password</span>
            </button>
          </div>
        </div>
      </div>

      {/* Password List */}
      <div className="space-y-4">
        {state.passwords.map((password) => (
          <div
            key={password.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                    <Globe className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{password.title}</h3>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => togglePasswordVisibility(password.id)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                    aria-label={showPassword[password.id] ? 'Hide password' : 'Show password'}
                  >
                    {showPassword[password.id] ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(password.password)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                    aria-label="Copy password"
                  >
                    <Copy size={20} />
                  </button>
                  <button
                    onClick={() => setEditingPassword(password.id)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                    aria-label="Edit password"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    onClick={() => handleDeletePassword(password.id)}
                    className="p-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                    aria-label="Delete password"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">{password.username}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <LockIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">
                    {showPassword[password.id] ? password.password : '••••••••'}
                  </span>
                </div>
                {password.website && (
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <a
                      href={password.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {password.website}
                    </a>
                  </div>
                )}
                {password.notes && (
                  <div className="md:col-span-2 flex items-start space-x-2">
                    <FileText className="w-4 h-4 text-gray-400 mt-1" />
                    <span className="text-gray-600 dark:text-gray-300">{password.notes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 