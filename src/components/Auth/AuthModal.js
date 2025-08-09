import React, { useState } from 'react';
import { LogIn, UserPlus, X } from 'lucide-react';
import { registerUser, loginUser } from '../../services/firebaseService';
import { setStorageMode, STORAGE_MODES, migrateLocalToCloud } from '../../services/storageService';

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!isLogin && password !== confirmPassword) {
        throw new Error("Passwords don't match");
      }

      let user;
      if (isLogin) {
        user = await loginUser(email, password);
      } else {
        user = await registerUser(email, password);
      }

      // Set storage mode to cloud
      setStorageMode(STORAGE_MODES.CLOUD);

      // If registering, offer to migrate local data
      if (!isLogin) {
        setMigrationStatus('pending');
      } else {
        onAuthSuccess(user);
        onClose();
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMigration = async (shouldMigrate) => {
    if (shouldMigrate) {
      setMigrationStatus('migrating');
      try {
        const result = await migrateLocalToCloud();
        setMigrationStatus('success');
        setTimeout(() => {
          onAuthSuccess();
          onClose();
        }, 2000);
      } catch (error) {
        console.error("Migration error:", error);
        setMigrationStatus('error');
        setError(error.message);
      }
    } else {
      // Skip migration
      onAuthSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        {migrationStatus === 'pending' ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Migrate Your Data?</h2>
            <p className="mb-6 text-gray-600">
              Would you like to migrate your local study data to your new cloud account?
              This will allow you to access your data from any device.
            </p>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => handleMigration(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Yes, Migrate Data
              </button>
              <button
                onClick={() => handleMigration(false)}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300"
              >
                No, Start Fresh
              </button>
            </div>
          </div>
        ) : migrationStatus === 'migrating' ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Migrating your data to the cloud...</p>
          </div>
        ) : migrationStatus === 'success' ? (
          <div className="text-center py-8">
            <div className="bg-green-100 text-green-800 p-4 rounded-md mb-4">
              Data migration successful!
            </div>
            <p>Redirecting to your dashboard...</p>
          </div>
        ) : migrationStatus === 'error' ? (
          <div className="text-center py-8">
            <div className="bg-red-100 text-red-800 p-4 rounded-md mb-4">
              Error migrating data: {error}
            </div>
            <button
              onClick={() => setMigrationStatus(null)}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center">
              {isLogin ? 'Sign In' : 'Create Account'}
            </h2>
            
            {error && (
              <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              {!isLogin && (
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 flex items-center justify-center"
              >
                {loading ? (
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                ) : isLogin ? (
                  <>
                    <LogIn size={18} className="mr-2" />
                    Sign In
                  </>
                ) : (
                  <>
                    <UserPlus size={18} className="mr-2" />
                    Create Account
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 hover:underline"
              >
                {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;