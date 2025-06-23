import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { User, Mail, Briefcase, Globe, Edit2, Save, X } from 'lucide-react';

export const Profile: React.FC = () => {
  const { currentUser, updateUser, darkMode } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    bio: currentUser?.bio || '',
    experience: currentUser?.experience || '',
    specialization: currentUser?.specialization || '',
    languages: currentUser?.languages?.join(', ') || '',
    gender: currentUser?.gender || ''
  });

  if (!currentUser) return null;

  const handleSave = () => {
    const updates = {
      ...formData,
      languages: formData.languages ? formData.languages.split(',').map(lang => lang.trim()) : []
    };
    
    updateUser(currentUser.id, updates);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: currentUser.name,
      email: currentUser.email,
      bio: currentUser.bio || '',
      experience: currentUser.experience || '',
      specialization: currentUser.specialization || '',
      languages: currentUser.languages?.join(', ') || '',
      gender: currentUser.gender || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Profile Settings
          </h1>
          <p className={`text-lg mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your personal information and preferences
          </p>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit2 size={16} className="mr-2" />
            Edit Profile
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save size={16} className="mr-2" />
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
                darkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <X size={16} className="mr-2" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className={`p-8 rounded-xl border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-start space-x-6">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            <div className="relative">
              <img
                src={currentUser.profileImage || 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=400'}
                alt={currentUser.name}
                className="h-24 w-24 rounded-full object-cover"
              />
              {currentUser.verified && (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                  <User size={16} className="text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <User className="inline h-4 w-4 mr-1" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                ) : (
                  <p className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {currentUser.name}
                  </p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                ) : (
                  <p className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {currentUser.email}
                  </p>
                )}
              </div>
            </div>

            {/* Role-specific fields */}
            {(currentUser.role === 'doctor' || currentUser.role === 'caretaker') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentUser.role === 'doctor' && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <Briefcase className="inline h-4 w-4 mr-1" />
                      Specialization
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.specialization}
                        onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="">Select specialization</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Dermatology">Dermatology</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="General Medicine">General Medicine</option>
                      </select>
                    ) : (
                      <p className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {currentUser.specialization || 'Not specified'}
                      </p>
                    )}
                  </div>
                )}

                {currentUser.role === 'caretaker' && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Gender
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <p className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {currentUser.gender || 'Not specified'}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Experience
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.experience}
                      onChange={(e) => setFormData({...formData, experience: e.target.value})}
                      placeholder="e.g., 5 years"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  ) : (
                    <p className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {currentUser.experience || 'Not specified'}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Languages (for caretakers) */}
            {currentUser.role === 'caretaker' && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <Globe className="inline h-4 w-4 mr-1" />
                  Languages
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.languages}
                    onChange={(e) => setFormData({...formData, languages: e.target.value})}
                    placeholder="English, Spanish, French"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                ) : (
                  <p className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {currentUser.languages?.join(', ') || 'Not specified'}
                  </p>
                )}
              </div>
            )}

            {/* Bio */}
            {(currentUser.role === 'doctor' || currentUser.role === 'caretaker') && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    rows={4}
                    placeholder="Tell us about yourself..."
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                ) : (
                  <p className={`text-lg leading-relaxed ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {currentUser.bio || 'No bio provided'}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Stats */}
      <div className={`p-6 rounded-xl border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Account Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
              Account Type
            </p>
            <p className={`text-lg font-semibold capitalize ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {currentUser.role}
            </p>
          </div>
          
          <div>
            <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
              Verification Status
            </p>
            <div className="flex items-center">
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                currentUser.verified
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {currentUser.verified ? 'Verified' : 'Pending Verification'}
              </span>
            </div>
          </div>
          
          {currentUser.rating && (
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                Rating
              </p>
              <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentUser.rating.toFixed(1)} / 5.0
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};