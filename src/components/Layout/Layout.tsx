import React, { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { useStore } from '../../store/useStore';
import { 
  Home, 
  Calendar, 
  User, 
  Shield, 
  MessageSquare, 
  Settings, 
  LogOut
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    currentUser, 
    darkMode, 
    setCurrentUser  // Use setCurrentUser instead of logoutUser
  } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Logout function
  const handleLogout = () => {
    setCurrentUser(null);  // Clear current user
    navigate('/login');    // Redirect to login
  };

  // Close sidebar when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Navigation menu items
  const menuItems = [
    { 
      icon: Home, 
      label: 'Dashboard', 
      path: '/dashboard',
      roles: ['patient', 'doctor', 'caretaker', 'medical-assistant']
    },
    { 
      icon: Calendar, 
      label: 'Appointments', 
      path: '/appointments',
      roles: ['patient', 'doctor', 'caretaker']
    },
    { 
      icon: User, 
      label: 'Profile', 
      path: '/profile',
      roles: ['patient', 'doctor', 'caretaker', 'medical-assistant']
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      path: '/settings',
      roles: ['patient', 'doctor', 'caretaker', 'medical-assistant']
    },
    { 
      icon: MessageSquare, 
      label: 'Messaging', 
      path: '/chat',
      roles: ['patient', 'doctor', 'caretaker']
    }
  ];

  // Filtered menu items based on user role
  const filteredMenuItems = currentUser 
    ? menuItems.filter(item => item.roles.includes(currentUser.role)) 
    : [];

  return (
    <div className={`
      flex h-screen overflow-hidden 
      ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}
    `}>
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
        ${darkMode 
          ? 'bg-gray-800 border-r border-gray-700' 
          : 'bg-white border-r border-gray-200'}
        shadow-lg
      `}>
        <div className="flex flex-col h-full">
          {/* Logo and Brand */}
          <div className={`
            p-6 border-b flex justify-between items-center
            ${darkMode 
              ? 'border-gray-700 bg-gray-800' 
              : 'border-gray-200 bg-white'}
          `}>
            <div>
              <h1 className={`
                text-2xl font-bold 
                ${darkMode ? 'text-white' : 'text-gray-900'}
              `}>
                Heal Together
              </h1>
              <p className={`
                text-sm 
                ${darkMode ? 'text-gray-400' : 'text-gray-600'}
              `}>
                Healthcare Platform
              </p>
            </div>
            {/* Mobile Close Button */}
            <button 
              onClick={toggleSidebar} 
              className={`
                lg:hidden p-2 rounded-lg
                ${darkMode 
                  ? 'hover:bg-gray-700 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-600'}
              `}
            >
              ✕
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {filteredMenuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  // Close sidebar on smaller screens
                  if (window.innerWidth < 1024) {
                    setIsSidebarOpen(false);
                  }
                }}
                className={`
                  w-full flex items-center p-3 rounded-lg transition-colors duration-200
                  ${location.pathname === item.path 
                    ? (darkMode 
                      ? 'bg-primary-700 text-white' 
                      : 'bg-primary-100 text-primary-700')
                    : (darkMode 
                      ? 'hover:bg-gray-700 text-gray-300 hover:text-white' 
                      : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900')
                  }
                `}
              >
                <item.icon className="mr-3" size={20} />
                {item.label}
              </button>
            ))}
          </nav>

          {/* User Profile and Logout */}
          <div className={`
            p-4 border-t 
            ${darkMode 
              ? 'border-gray-700 bg-gray-800' 
              : 'border-gray-200 bg-white'}
          `}>
            <div className="flex items-center mb-4">
              <div className={`
                w-12 h-12 rounded-full mr-4 
                ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}
              `}>
                {/* User Avatar Placeholder */}
              </div>
              <div>
                <p className={`
                  font-semibold 
                  ${darkMode ? 'text-white' : 'text-gray-900'}
                `}>
                  {currentUser?.name || 'User'}
                </p>
                <p className={`
                  text-sm 
                  ${darkMode ? 'text-gray-400' : 'text-gray-600'}
                `}>
                  {currentUser?.role || 'Role'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className={`
                w-full flex items-center justify-center p-3 rounded-lg
                ${darkMode 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-red-100 hover:bg-red-200 text-red-700'}
                transition-colors duration-200
              `}
            >
              <LogOut className="mr-2" size={20} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <Navbar 
          toggleSidebar={toggleSidebar}
        />

        {/* Main Content */}
        <main className={`
          flex-1 overflow-x-hidden overflow-y-auto p-6
          ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}
        `}>
          {children}
        </main>
      </div>
    </div>
  );
};