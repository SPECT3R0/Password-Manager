import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <ShieldCheck className="h-7 w-7 text-indigo-600 dark:text-indigo-400 animate-bounce" />
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight select-none">SPECT3R - SPM </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none transition-colors"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 