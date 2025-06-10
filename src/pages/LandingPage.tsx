import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Fingerprint, Star, Users, Briefcase } from 'lucide-react';
import Navbar from '../components/Navbar';
import heroImage from '../assets/images/password_phone.jpg'; 
import cyberSecurityImage from '../assets/images/cyber_security.jpg';
import forgotPasswordImage from '../assets/images/forgot_password.jpg';
import laptopPasswordImage from '../assets/images/laptop_password.jpg';

export default function LandingPage() {
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-indigo-100 dark:from-blue-950 dark:via-gray-900 dark:to-purple-950 text-gray-900 dark:text-gray-100 flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <motion.section 
        className="relative flex flex-col items-center justify-center text-center py-24 md:py-36 px-4 overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-indigo-900 dark:to-blue-900 shadow-xl"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <div className="absolute inset-0 z-0 bg-pattern-light dark:bg-pattern-dark opacity-5"></div>
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-10 md:space-y-0 md:space-x-12 py-16">
          <motion.div 
            className="md:w-3/5 text-center md:text-left"
            initial={{ opacity: 0, scale: 0.5 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <ShieldCheck className="h-20 w-20 text-indigo-600 dark:text-indigo-400 mx-auto md:mx-0 mb-6 animate-pulse" />
            <motion.h1 
              className="text-3xl md:text-4xl font-extrabold leading-tight text-gray-900 dark:text-white mb-4 drop-shadow-lg"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              VaultKeeper: Your Digital Fortress
            </motion.h1>
            <motion.p 
              className="text-base md:text-lg text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto md:mx-0"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Securely manage all your passwords and sensitive information in one place.
              Experience peace of mind with robust encryption and intuitive control.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row justify-center md:justify-start space-y-3 sm:space-y-0 sm:space-x-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Link 
                to="/signup" 
                className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 text-base"
              >
                Get Started - It's Free!
              </Link>
              <Link 
                to="/login" 
                className="px-6 py-3 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 font-semibold rounded-full shadow-lg border border-indigo-600 dark:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 text-base"
              >
                Already a User? Sign In
              </Link>
            </motion.div>
          </motion.div>
          <motion.div
            className="md:w-2/5 flex justify-center items-center py-8 md:py-0"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <img src={heroImage} alt="Password Management on Phone" className="max-w-full h-96 w-full rounded-lg shadow-2xl object-cover" />
          </motion.div>
        </div>
      </motion.section>

      {/* Benefits Section */}
      <motion.section 
        className="py-24 md:py-32 bg-white dark:bg-gray-900 px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-12">
            Why VaultKeeper?
          </h2>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ staggerChildren: 0.2 }}
          >
            <motion.div className="flex flex-col items-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300" variants={itemVariants}>
              <Lock className="h-16 w-16 text-indigo-500 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Unbreakable Security</h3>
              <p className="text-base text-gray-700 dark:text-gray-300 text-center">
                Leveraging state-of-the-art encryption, VaultKeeper ensures your data is impenetrable.
                Your master password is the only key, and we never store it.
              </p>
            </motion.div>
            <motion.div className="flex flex-col items-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300" variants={itemVariants}>
              <Fingerprint className="h-16 w-16 text-green-500 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Seamless Experience</h3>
              <p className="text-base text-gray-700 dark:text-gray-300 text-center">
                Intuitive design and easy-to-use features make managing your digital life effortless.
                Access your passwords anytime, anywhere.
              </p>
            </motion.div>
            <motion.div className="flex flex-col items-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300" variants={itemVariants}>
              <Star className="h-16 w-16 text-yellow-500 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Future-Proofed</h3>
              <p className="text-base text-gray-700 dark:text-gray-300 text-center">
                Regular updates and a commitment to privacy mean VaultKeeper evolves with your security needs.
                Stay ahead of digital threats.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features/Solutions Section with Laptop and Forgot Password Images */}
      <motion.section 
        className="py-24 md:py-32 bg-white dark:bg-gray-900 px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-12">
            Solutions Designed For You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <motion.div 
              className="flex flex-col items-center p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-indigo-900 dark:to-blue-900 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
              variants={itemVariants}
            >
              <img src={laptopPasswordImage} alt="Password on Laptop" className="max-w-md h-auto mb-8 rounded-lg shadow-xl" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Cross-Device Compatibility</h3>
              <p className="text-base text-gray-700 dark:text-gray-300 text-center">
                Access your vault securely from any device – desktop, laptop, or mobile.
                Your passwords are always with you, protected and synchronized.
              </p>
            </motion.div>
            <motion.div 
              className="flex flex-col items-center p-8 bg-gradient-to-br from-orange-50 to-red-50 dark:from-indigo-900 dark:to-blue-900 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
              variants={itemVariants}
            >
              <img src={forgotPasswordImage} alt="Forgot Password" className="max-w-md h-auto mb-8 rounded-lg shadow-xl" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Never Forget a Password Again</h3>
              <p className="text-base text-gray-700 dark:text-gray-300 text-center">
                Our intuitive recovery options and secure notes mean you're never locked out.
                Regain access effortlessly and safely.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* About Creators Section */}
      <motion.section 
        className="py-24 md:py-32 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-blue-950 dark:to-purple-950 px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-12">
            Meet the Visionaries
          </h2>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ staggerChildren: 0.2 }}
          >
            <motion.div className="flex flex-col items-center p-8 bg-indigo-50 dark:bg-gray-800 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300" variants={itemVariants}>
              <Users className="h-16 w-16 text-purple-500 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">The Development Team</h3>
              <p className="text-base text-gray-700 dark:text-gray-100 text-center">
                A passionate group of developers dedicated to building secure,
                user-friendly applications that empower digital freedom.
              </p>
            </motion.div>
            <motion.div className="flex flex-col items-center p-8 bg-indigo-50 dark:bg-gray-800 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300" variants={itemVariants}>
              <Briefcase className="h-16 w-16 text-red-500 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Our Mission</h3>
              <p className="text-base text-gray-700 dark:text-gray-100 text-center">
                To provide a robust and reliable password management solution
                that prioritizes user privacy and data integrity above all else.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer Section */}
      <footer className="py-10 bg-gray-900 dark:bg-gray-950 text-white text-center text-base">
        <div className="max-w-6xl mx-auto px-6">
          <p>&copy; {new Date().getFullYear()} VaultKeeper. All rights reserved.</p>
          <p className="mt-3">Built with ❤️ for a more secure digital world.</p>
        </div>
      </footer>
    </div>
  );
} 