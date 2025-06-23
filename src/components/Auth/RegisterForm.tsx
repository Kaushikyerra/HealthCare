import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { registerUser } from '../../services/authService';
import { Heart, UserCheck, Stethoscope, Users, Loader2, MapPin, Navigation } from 'lucide-react';

export const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient' as 'patient' | 'doctor' | 'caretaker' | 'medical-assistant',
    specialization: '',
    experience: '',
    languages: '',
    bio: '',
    gender: '',
    // Location fields
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    latitude: '',
    longitude: '',
    // Medical Assistant fields (optional)
    medicalId: '',
    internshipCertificate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);

  const { setCurrentUser, darkMode, fetchUsers, fetchUserAppointments, fetchCaretakerRequests } = useStore();
  const navigate = useNavigate();

  // Function to get address from coordinates using reverse geocoding
  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyAUZdfTdxFnRFwYmi0LYZDWf6R4MWP3uDY`
      );
      const data = await response.json();
      
      if (data.results && data.results[0]) {
        const result = data.results[0];
        const addressComponents = result.address_components;
        
        let address = '';
        let city = '';
        let state = '';
        let zipCode = '';
        let country = '';
        
        addressComponents.forEach((component: any) => {
          const types = component.types;
          
          if (types.includes('street_number') || types.includes('route')) {
            address += component.long_name + ' ';
          }
          if (types.includes('locality')) {
            city = component.long_name;
          }
          if (types.includes('administrative_area_level_1')) {
            state = component.short_name;
          }
          if (types.includes('postal_code')) {
            zipCode = component.long_name;
          }
          if (types.includes('country')) {
            country = component.long_name;
          }
        });
        
        return {
          address: address.trim(),
          city,
          state,
          zipCode,
          country
        };
      }
    } catch (error) {
      console.error('Error getting address:', error);
    }
    
    return null;
  };

  // Function to detect user's location
  const detectLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLocationLoading(true);
    setError('');

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Get address from coordinates
      const addressData = await getAddressFromCoordinates(latitude, longitude);
      
      setFormData(prev => ({
        ...prev,
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        ...(addressData && {
          address: addressData.address,
          city: addressData.city,
          state: addressData.state,
          zipCode: addressData.zipCode,
          country: addressData.country
        })
      }));
      
      setLocationDetected(true);
    } catch (error: any) {
      console.error('Location detection error:', error);
      if (error.code === 1) {
        setError('Location access denied. Please allow location access or enter manually.');
      } else if (error.code === 2) {
        setError('Location unavailable. Please check your device location settings.');
      } else if (error.code === 3) {
        setError('Location request timed out. Please try again.');
      } else {
        setError('Failed to detect location. Please try again or enter manually.');
      }
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const userData = {
        ...formData,
        languages: formData.languages ? formData.languages.split(',').map(lang => lang.trim()) : [],
      };

      const response = await registerUser(userData);
      
      // Set current user - extract user from response
      setCurrentUser(response.user);
      
      // Also set token in local storage
      if (response.token) {
        localStorage.setItem('authToken', response.token);
      }
      
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const roleIcons = {
    patient: Heart,
    doctor: Stethoscope,
    caretaker: Users,
    'medical-assistant': UserCheck
  };

  const roleColors = {
    patient: 'from-emerald-500 to-teal-600',
    doctor: 'from-blue-500 to-indigo-600',
    caretaker: 'from-purple-500 to-pink-600',
    'medical-assistant': 'from-orange-500 to-red-600'
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
            Join Heal Together
          </h2>
          <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Create your account to get started
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className={`block text-sm font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Register as a
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

            {/* Name */}
            <div>
              <label htmlFor="name" className={`block text-sm font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`mt-1 block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  darkMode
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter your full name"
              />
            </div>

            {/* Email */}
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

            {/* Password */}
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
                placeholder="Create a password"
              />
            </div>

            {/* Doctor Specific Fields */}
            {formData.role === 'doctor' && (
              <>
                {/* Specialization */}
                <div>
                  <label htmlFor="specialization" className={`block text-sm font-medium ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Medical Specialization
                  </label>
                  <input
                    id="specialization"
                    name="specialization"
                    type="text"
                    required
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="e.g., Cardiology, Pediatrics"
                  />
                </div>
              </>
            )}

            {/* Caretaker Gender */}
            {formData.role === 'caretaker' && (
              <div>
                <label htmlFor="gender" className={`block text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Gender
                </label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className={`mt-1 block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    darkMode
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}

            {/* Experience */}
            {(formData.role === 'doctor' || formData.role === 'caretaker') && (
              <div>
                <label htmlFor="experience" className={`block text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Experience
                </label>
                <input
                  id="experience"
                  type="text"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className={`mt-1 block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    darkMode
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="e.g., 5 years"
                />
              </div>
            )}

            {/* Languages */}
            {formData.role === 'caretaker' && (
              <div>
                <label htmlFor="languages" className={`block text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Languages (comma separated)
                </label>
                <input
                  id="languages"
                  type="text"
                  value={formData.languages}
                  onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                  className={`mt-1 block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    darkMode
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="English, Spanish, French"
                />
              </div>
            )}

            {/* Bio */}
            {(formData.role === 'doctor' || formData.role === 'caretaker') && (
              <div>
                <label htmlFor="bio" className={`block text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className={`mt-1 block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    darkMode
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Tell us about yourself..."
                />
              </div>
            )}

            {/* Location Fields for Doctors */}
            {formData.role === 'doctor' && (
              <>
                <div className="border-t pt-4">
                  <h3 className={`text-lg font-semibold mb-4 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Practice Location
                  </h3>
                </div>

                {/* Automatic Location Detection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`font-medium ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Automatic Location Detection
                      </h4>
                      <p className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        We'll automatically detect your location for better patient matching
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={detectLocation}
                      disabled={locationLoading || locationDetected}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        locationDetected
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : locationLoading
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {locationLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : locationDetected ? (
                        <MapPin className="h-4 w-4" />
                      ) : (
                        <Navigation className="h-4 w-4" />
                      )}
                      <span>
                        {locationLoading ? 'Detecting...' : locationDetected ? 'Location Detected' : 'Detect Location'}
                      </span>
                    </button>
                  </div>

                  {/* Display detected location */}
                  {locationDetected && (
                    <div className={`p-4 rounded-lg border ${
                      darkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
                    }`}>
                      <div className="flex items-start space-x-3">
                        <MapPin className={`h-5 w-5 mt-0.5 ${
                          darkMode ? 'text-green-400' : 'text-green-600'
                        }`} />
                        <div className="flex-1">
                          <h5 className={`font-medium ${
                            darkMode ? 'text-green-300' : 'text-green-800'
                          }`}>
                            Location Detected Successfully
                          </h5>
                          <div className={`text-sm mt-1 space-y-1 ${
                            darkMode ? 'text-green-400' : 'text-green-700'
                          }`}>
                            {formData.address && <p><strong>Address:</strong> {formData.address}</p>}
                            {formData.city && <p><strong>City:</strong> {formData.city}, {formData.state}</p>}
                            {formData.zipCode && <p><strong>ZIP:</strong> {formData.zipCode}</p>}
                            {formData.country && <p><strong>Country:</strong> {formData.country}</p>}
                            {formData.latitude && formData.longitude && (
                              <p><strong>Coordinates:</strong> {formData.latitude}, {formData.longitude}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Manual location input as fallback */}
                  {!locationDetected && (
                    <div className={`p-4 rounded-lg border ${
                      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <h5 className={`font-medium mb-3 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Manual Location Entry (Optional)
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="manual-address" className={`block text-sm font-medium ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Street Address
                          </label>
                          <input
                            id="manual-address"
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                              darkMode
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            }`}
                            placeholder="123 Main St"
                          />
                        </div>

                        <div>
                          <label htmlFor="manual-city" className={`block text-sm font-medium ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            City
                          </label>
                          <input
                            id="manual-city"
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                              darkMode
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            }`}
                            placeholder="New York"
                          />
                        </div>

                        <div>
                          <label htmlFor="manual-state" className={`block text-sm font-medium ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            State/Province
                          </label>
                          <input
                            id="manual-state"
                            type="text"
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                              darkMode
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            }`}
                            placeholder="NY"
                          />
                        </div>

                        <div>
                          <label htmlFor="manual-zipCode" className={`block text-sm font-medium ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            ZIP/Postal Code
                          </label>
                          <input
                            id="manual-zipCode"
                            type="text"
                            value={formData.zipCode}
                            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                            className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                              darkMode
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            }`}
                            placeholder="10001"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label htmlFor="manual-country" className={`block text-sm font-medium ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Country
                        </label>
                        <input
                          id="manual-country"
                          type="text"
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                            darkMode
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                          placeholder="United States"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Medical Assistant Fields */}
            {formData.role === 'medical-assistant' && (
              <>
                <div className="border-t pt-4">
                  <h3 className={`text-lg font-semibold mb-4 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Medical Assistant Information
                  </h3>
                  <p className={`text-sm mb-4 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Tell us about your medical background and experience
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="medicalId" className={`block text-sm font-medium ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Medical ID Number
                    </label>
                    <input
                      id="medicalId"
                      type="text"
                      value={formData.medicalId || ''}
                      onChange={(e) => setFormData({ ...formData, medicalId: e.target.value })}
                      className={`mt-1 block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        darkMode
                          ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="Enter your Medical Council ID (optional)"
                    />
                  </div>

                  <div>
                    <label htmlFor="internshipCertificate" className={`block text-sm font-medium ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Internship Certificate (if graduated)
                    </label>
                    <input
                      id="internshipCertificate"
                      type="text"
                      value={formData.internshipCertificate || ''}
                      onChange={(e) => setFormData({ ...formData, internshipCertificate: e.target.value })}
                      className={`mt-1 block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        darkMode
                          ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="Certificate number or reference (optional)"
                    />
                  </div>
                </div>
              </>
            )}
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
                <UserCheck className="mr-2 h-4 w-4" />
              )}
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

          <div className="text-center">
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign in
              </button>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};