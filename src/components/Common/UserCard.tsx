import React from 'react';
import { User } from '../../types';
import { Star, MapPin, Clock, CheckCircle, Languages } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface UserCardProps {
  user: User;
  onAction?: (user: User) => void;
  actionLabel?: string;
  showFullProfile?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  onAction, 
  actionLabel = 'Select',
  showFullProfile = false
}) => {
  const { darkMode } = useStore();

  return (
    <div className={`p-6 rounded-xl border transition-all duration-200 hover:shadow-lg ${
      darkMode 
        ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
        : 'bg-white border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex items-start space-x-4">
        {/* Profile Image */}
        <div className="flex-shrink-0">
          <div className="relative">
            <img
              src={user.profileImage || `https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=400`}
              alt={user.name}
              className="h-16 w-16 rounded-full object-cover"
            />
            {user.verified && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                <CheckCircle size={12} className="text-white" />
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-semibold truncate ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {user.name}
            </h3>
            {user.rating && (
              <div className="flex items-center space-x-1">
                <Star size={16} className="text-yellow-400 fill-current" />
                <span className={`text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {user.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Role & Specialization */}
          <div className="mt-1">
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {user.role === 'doctor' && user.specialization && `${user.specialization} Specialist`}
              {user.role === 'caretaker' && 'Professional Caretaker'}
              {user.role === 'patient' && 'Patient'}
            </span>
          </div>

          {/* Experience */}
          {user.experience && (
            <div className={`flex items-center mt-2 text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <Clock size={14} className="mr-1" />
              <span>{user.experience} experience</span>
            </div>
          )}

          {/* Languages */}
          {user.languages && user.languages.length > 0 && (
            <div className={`flex items-center mt-2 text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <Languages size={14} className="mr-1" />
              <span>{user.languages.join(', ')}</span>
            </div>
          )}

          {/* Gender (for caretakers) */}
          {user.role === 'caretaker' && user.gender && (
            <div className={`mt-2 text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <span>{user.gender}</span>
            </div>
          )}

          {/* Bio */}
          {user.bio && (
            <p className={`mt-3 text-sm leading-relaxed ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            } ${showFullProfile ? '' : 'line-clamp-2'}`}>
              {user.bio}
            </p>
          )}

          {/* Availability (for caretakers) */}
          {user.role === 'caretaker' && user.available !== undefined && (
            <div className="mt-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.available
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {user.available ? 'Available' : 'Busy'}
              </span>
            </div>
          )}

          {/* Action Button */}
          {onAction && (
            <div className="mt-4">
              <button
                onClick={() => onAction(user)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {actionLabel}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};