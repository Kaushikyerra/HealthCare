import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { loginUser } from '../../services/authService';
import { Heart, LogIn, Stethoscope, Users, Loader2, Clipboard } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'patient' as 'patient' | 'doctor' | 'caretaker' | 'medical-assistant'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { setCurrentUser, darkMode, fetchUsers, fetchUserAppointments, fetchCaretakerRequests } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('Login Attempt:', {
        email: formData.email,
        role: formData.role
      });

      const user = await loginUser(formData.email, formData.password);
      
      console.log('Received User:', user);
      
      if (user.role !== formData.role) {
        console.warn('Role Mismatch:', {
          selectedRole: formData.role,
          userRole: user.role
        });
        throw new Error('Role mismatch. Please select the correct role.');
      }
      
      setCurrentUser(user);
      
      // Navigate to dashboard - App.tsx will handle fetching data after authentication
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login Error:', error);
      
      // More specific error messages
      let errorMessage = 'Login failed';
      if (error.message.includes('Unable to connect to the server')) {
        errorMessage = 'Server is unavailable. Please check your network connection.';
      } else if (error.message.includes('Invalid email or password')) {
        errorMessage = 'Incorrect email or password. Please try again.';
      } else if (error.message.includes('Role mismatch')) {
        errorMessage = 'Please select the correct user role.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const roleIcons = {
    patient: Heart,
    doctor: Stethoscope,
    caretaker: Users,
    'medical-assistant': Clipboard
  };

  const roleColors = {
    patient: 'from-emerald-500 to-teal-600',
    doctor: 'from-blue-500 to-indigo-600',
    caretaker: 'from-purple-500 to-pink-600',
    'medical-assistant': 'from-yellow-500 to-orange-600'
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${
      darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-blue-50'
    }`}>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className={`mx-auto h-16 w-16 bg-gradient-to-r ${roleColors[formData.role]} rounded-2xl flex items-center justify-center shadow-lg`}>
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h2 className={`mt-6 text-3xl font-bold ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Welcome Back
          </h2>
          <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Sign in to your Heal Together account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className={`block text-sm font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                I am a
              </label>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3">
                {(['patient', 'doctor', 'caretaker', 'medical-assistant'] as const).map((role) => {
                  const Icon = roleIcons[role];
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData({ ...formData, role })}
                      className={`p-3 border-2 rounded-xl text-center transition-all duration-200 ${
                        formData.role === role
                          ? `border-transparent bg-gradient-to-r ${roleColors[role]} text-white shadow-lg transform scale-105`
                          : darkMode
                          ? 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <Icon size={20} className="mx-auto mb-1" />
                      <span className="text-sm capitalize font-medium">{role.replace('-', ' ')}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className={`block text-sm font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`mt-1 block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  darkMode
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter your email"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className={`block text-sm font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`mt-1 block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  darkMode
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r ${roleColors[formData.role]} hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>

          <div className="text-center">
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign up
              </button>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};