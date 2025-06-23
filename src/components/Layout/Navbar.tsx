import React, { useState, useMemo } from 'react';
import { 
  Menu, 
  Bell, 
  Search, 
  Sun, 
  Moon,
  Calendar,
  Pill,
  UserPlus,
  FileText,
  AlertCircle,
  Settings
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Link } from 'react-router-dom';

interface NavbarProps {
  toggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const { 
    currentUser, 
    darkMode, 
    toggleDarkMode,
    notifications,
    markNotificationAsRead
  } = useStore();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Filter notifications based on current user's role
  const userNotifications = useMemo(() => {
    return currentUser 
      ? notifications.filter(notif => notif.role === currentUser.role)
      : [];
  }, [notifications, currentUser]);

  // Get unread notifications
  const unreadNotifications = useMemo(() => {
    return userNotifications.filter(notif => !notif.read);
  }, [userNotifications]);

  // Map notification types to icons
  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'appointment': return Calendar;
      case 'prescription': return Pill;
      case 'request': return UserPlus;
      case 'urgent': return AlertCircle;
      default: return FileText;
    }
  };

  return (
    <nav className={`
      sticky top-0 z-20 flex items-center justify-between p-4 
      ${darkMode 
        ? 'bg-gray-800 border-b border-gray-700' 
        : 'bg-white border-b border-gray-200'
      }
    `}>
      {/* Left Section - Sidebar Toggle */}
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className={`
            p-2 rounded-lg mr-4 
            ${darkMode 
              ? 'hover:bg-gray-700 text-gray-300' 
              : 'hover:bg-gray-100 text-gray-600'}
          `}
        >
          <Menu size={24} />
        </button>

        {/* Search Bar */}
        <div className={`
          hidden md:flex items-center w-full max-w-md 
          ${darkMode 
            ? 'bg-gray-700 text-gray-300' 
            : 'bg-gray-100 text-gray-600'}
          rounded-lg px-4 py-2
        `}>
          <Search size={20} className="mr-2" />
          <input 
            type="text" 
            placeholder="Search..." 
            className={`
              w-full bg-transparent outline-none 
              ${darkMode ? 'text-white' : 'text-gray-900'}
            `}
          />
        </div>
      </div>

      {/* Right Section - Notifications and User Actions */}
      <div className="flex items-center space-x-4 relative">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className={`
            p-2 rounded-lg 
            ${darkMode 
              ? 'hover:bg-gray-700 text-gray-300' 
              : 'hover:bg-gray-100 text-gray-600'}
          `}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className={`
              relative p-2 rounded-lg 
              ${darkMode 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-600'}
            `}
          >
            <Bell size={20} />
            {unreadNotifications.length > 0 && (
              <span className={`
                absolute top-0 right-0 h-4 w-4 rounded-full flex items-center justify-center text-xs
                ${darkMode ? 'bg-red-500 text-white' : 'bg-red-600 text-white'}
              `}>
                {unreadNotifications.length}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isNotificationOpen && (
            <div className={`
              absolute right-0 top-full mt-2 w-80 rounded-lg shadow-lg
              ${darkMode 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'}
            `}>
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className={`
                  font-semibold 
                  ${darkMode ? 'text-white' : 'text-gray-900'}
                `}>
                  Notifications
                </h3>
              </div>
              
              {userNotifications.length === 0 ? (
                <div className="p-4 text-center">
                  <p className={`
                    text-sm 
                    ${darkMode ? 'text-gray-400' : 'text-gray-600'}
                  `}>
                    No notifications
                  </p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {userNotifications.map((notif) => {
                    const NotificationIcon = getNotificationIcon(notif.type);
                    return (
                      <div 
                        key={notif.id}
                        onClick={() => markNotificationAsRead(notif.id)}
                        className={`
                          p-4 border-b flex items-start cursor-pointer
                          ${notif.read 
                            ? (darkMode ? 'bg-gray-700/50' : 'bg-gray-100/50')
                            : (darkMode ? 'bg-blue-900/30' : 'bg-blue-100/50')}
                          ${darkMode 
                            ? 'border-gray-700 hover:bg-gray-700' 
                            : 'border-gray-200 hover:bg-gray-200'}
                        `}
                      >
                        <div className={`
                          p-2 rounded-lg mr-3
                          ${darkMode ? 'bg-gray-700' : 'bg-white'}
                        `}>
                          <NotificationIcon className={`
                            h-5 w-5 
                            ${darkMode ? 'text-blue-400' : 'text-blue-600'}
                          `} />
                        </div>
                        <div className="flex-1">
                          <h4 className={`
                            font-medium text-sm
                            ${darkMode ? 'text-white' : 'text-gray-900'}
                          `}>
                            {notif.title}
                          </h4>
                          <p className={`
                            text-xs 
                            ${darkMode ? 'text-gray-400' : 'text-gray-600'}
                          `}>
                            {notif.message}
                          </p>
                          <p className={`
                            text-xs mt-1
                            ${darkMode ? 'text-gray-500' : 'text-gray-500'}
                          `}>
                            {new Date(notif.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Greeting */}
        <div className={`
          hidden md:block 
          ${darkMode ? 'text-gray-300' : 'text-gray-600'}
        `}>
          Welcome, {currentUser?.name?.split(' ')[0] || 'User'}
        </div>

        {/* Settings Navigation */}
        {currentUser && (
          <Link
            to={'/settings'}
            className={`
              flex items-center space-x-2 p-2 rounded-lg transition-colors 
              ${darkMode 
                ? 'hover:bg-gray-700 text-gray-300 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'}
            `}
          >
            <Settings className="h-5 w-5" />
            <span className="hidden md:inline">Settings</span>
          </Link>
        )}
      </div>
    </nav>
  );
};