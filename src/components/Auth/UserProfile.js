import React, { useState } from 'react';
import { User, LogOut, Cloud, HardDrive, Check, AlertTriangle } from 'lucide-react';
import { logoutUser } from '../../services/firebaseService';
import { setStorageMode, STORAGE_MODES, getStorageMode } from '../../services/storageService';

const UserProfile = ({ user, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [storageMode, setStorageModeState] = useState(getStorageMode());
  const [showStorageToast, setShowStorageToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const handleLogout = async () => {
    try {
      await logoutUser();
      // Switch to local storage mode
      setStorageMode(STORAGE_MODES.LOCAL);
      onLogout();
    } catch (error) {
      console.error("Logout error:", error);
    }
    setShowDropdown(false);
  };

  const toggleStorageMode = () => {
    const newMode = storageMode === STORAGE_MODES.CLOUD ? STORAGE_MODES.LOCAL : STORAGE_MODES.CLOUD;
    
    if (newMode === STORAGE_MODES.CLOUD && !user) {
      setToastMessage('Please sign in to use cloud storage');
      setToastType('error');
      setShowStorageToast(true);
      setTimeout(() => setShowStorageToast(false), 3000);
      return;
    }
    
    setStorageMode(newMode);
    setStorageModeState(newMode);
    
    setToastMessage(newMode === STORAGE_MODES.CLOUD 
      ? 'Switched to cloud storage' 
      : 'Switched to local storage');
    setToastType('success');
    setShowStorageToast(true);
    setTimeout(() => setShowStorageToast(false), 3000);
    
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      {/* Storage mode toast notification */}
      {showStorageToast && (
        <div className={`absolute top-12 right-0 z-50 px-4 py-2 rounded-md shadow-md text-sm font-medium ${
          toastType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <div className="flex items-center">
            {toastType === 'success' ? (
              <Check size={16} className="mr-2" />
            ) : (
              <AlertTriangle size={16} className="mr-2" />
            )}
            {toastMessage}
          </div>
        </div>
      )}

      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 bg-white rounded-full px-3 py-1 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="bg-blue-100 rounded-full p-1">
          <User size={18} className="text-blue-600" />
        </div>
        <span className="text-sm font-medium text-gray-700">
          {user ? user.email.split('@')[0] : 'Guest'}
        </span>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
          <div className="py-1">
            <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
              {user ? (
                <div>
                  <p className="font-medium">{user.email}</p>
                  <p className="text-xs text-gray-500">Signed in</p>
                </div>
              ) : (
                <p>Not signed in</p>
              )}
            </div>

            <button
              onClick={toggleStorageMode}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {storageMode === STORAGE_MODES.CLOUD ? (
                <>
                  <HardDrive size={16} className="mr-2" />
                  Switch to Local Storage
                </>
              ) : (
                <>
                  <Cloud size={16} className="mr-2" />
                  Switch to Cloud Storage
                </>
              )}
            </button>

            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                <LogOut size={16} className="mr-2" />
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;