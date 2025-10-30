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
        await migrateLocalToCloud();
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
    <div className="fixed inset-0 bg-gradient-to-br from-black/70 via-slate-900/70 to-black/70 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md mx-4 relative border border-white/15 shadow-2xl shadow-amber-500/10">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {migrationStatus === 'pending' ? (
          <div className="text-center text-white">
            <h2 className="text-2xl font-black mb-4 font-mono tracking-wide">Migrate Your Data?</h2>
            <p className="mb-6 text-white/70">
              Would you like to migrate your local study data to your new cloud account?
              This will allow you to access your data from any device.
            </p>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => handleMigration(true)}
                className="bg-gradient-to-r from-amber-600 to-orange-700 text-white px-6 py-2 rounded-md border border-amber-400/40 hover:from-amber-700 hover:to-orange-800 transition-colors"
              >
                Yes, Migrate Data
              </button>
              <button
                onClick={() => handleMigration(false)}
                className="bg-white/10 text-white px-6 py-2 rounded-md border border-white/20 hover:bg-white/15 transition-colors"
              >
                No, Start Fresh
              </button>
            </div>
          </div>
        ) : migrationStatus === 'migrating' ? (
          <div className="text-center py-8 text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <p className="text-white/80">Migrating your data to the cloud...</p>
          </div>
        ) : migrationStatus === 'success' ? (
          <div className="text-center py-8 text-white">
            <div className="bg-green-600/20 text-green-200 p-4 rounded-md mb-4 border border-green-400/30">
              Data migration successful!
            </div>
            <p className="text-white/80">Redirecting to your dashboard...</p>
          </div>
        ) : migrationStatus === 'error' ? (
          <div className="text-center py-8 text-white">
            <div className="bg-red-600/20 text-red-200 p-4 rounded-md mb-4 border border-red-400/30">
              Error migrating data: {error}
            </div>
            <button
              onClick={() => setMigrationStatus(null)}
              className="bg-gradient-to-r from-amber-600 to-orange-700 text-white px-6 py-2 rounded-md border border-amber-400/40 hover:from-amber-700 hover:to-orange-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-black mb-6 text-center text-white font-mono tracking-wide">
              {isLogin ? 'Sign In' : 'Create Account'}
            </h2>
            
            {error && (
              <div className="bg-red-600/20 text-red-200 p-3 rounded-md mb-4 border border-red-400/30">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-white/80 mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-md text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-white/80 mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-md text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  required
                />
              </div>
              
              {!isLogin && (
                <div className="mb-4">
                  <label className="block text-white/80 mb-2" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-md text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    required
                  />
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-700 text-white py-2 rounded-md border border-amber-400/40 hover:from-amber-700 hover:to-orange-800 transition-colors flex items-center justify-center"
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
                className="text-amber-400 hover:text-amber-300 hover:underline"
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