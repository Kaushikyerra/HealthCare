import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { MedicalVisitRequest } from '../types';
import { 
  Stethoscope, 
  Calendar, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  User, 
  FileText,
  Navigation,
  Loader2
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const RequestMedicalAssistant: React.FC = () => {
  const { currentUser, darkMode, users, fetchUsers, submitMedicalVisitRequest } = useStore();
  const [formData, setFormData] = useState({
    visitDate: '',
    visitTime: '',
    serviceType: 'vitals-check' as 'vitals-check' | 'post-surgery-care' | 'medication-monitoring' | 'hospital-escort' | 'patient-education',
    urgency: 'medium' as 'low' | 'medium' | 'high',
    notes: '',
    estimatedDuration: '1 hour'
  });
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [patientLocation, setPatientLocation] = useState({
    address: '',
    latitude: 0,
    longitude: 0
  });

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Get verified medical assistants
  const medicalAssistants = users.filter(user => 
    user.role === 'medical-assistant' && 
    user.verificationStatus === 'approved'
  );

  // Function to get address from coordinates
  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyAUZdfTdxFnRFwYmi0LYZDWf6R4MWP3uDY`
      );
      const data = await response.json();
      
      if (data.results && data.results[0]) {
        return data.results[0].formatted_address;
      }
    } catch (error) {
      console.error('Error getting address:', error);
    }
    return null;
  };

  // Function to detect user's location
  const detectLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLocationLoading(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;
      const address = await getAddressFromCoordinates(latitude, longitude);
      
      setPatientLocation({
        address: address || `${latitude}, ${longitude}`,
        latitude,
        longitude
      });
      
      setLocationDetected(true);
    } catch (error: any) {
      console.error('Location detection error:', error);
      if (error.code === 1) {
        alert('Location access denied. Please allow location access or enter manually.');
      } else {
        alert('Failed to detect location. Please enter your address manually.');
      }
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('Please log in to request medical assistant services.');
      return;
    }

    if (!locationDetected && !patientLocation.address) {
      alert('Please provide your location for the medical assistant visit.');
      return;
    }

    try {
      const visitRequest: Omit<MedicalVisitRequest, 'id'> = {
        patientId: currentUser.id,
        patientName: currentUser.name,
        requestDate: new Date().toISOString().split('T')[0],
        visitDate: formData.visitDate,
        visitTime: formData.visitTime,
        status: 'pending',
        serviceType: formData.serviceType,
        patientAddress: patientLocation.address,
        patientLatitude: patientLocation.latitude,
        patientLongitude: patientLocation.longitude,
        notes: formData.notes,
        urgency: formData.urgency,
        estimatedDuration: formData.estimatedDuration,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await submitMedicalVisitRequest(visitRequest);
      alert('Medical assistant request submitted successfully! A verified medical assistant will be assigned to your case.');
      
      // Reset form
      setFormData({
        visitDate: '',
        visitTime: '',
        serviceType: 'vitals-check',
        urgency: 'medium',
        notes: '',
        estimatedDuration: '1 hour'
      });
      setLocationDetected(false);
      setPatientLocation({ address: '', latitude: 0, longitude: 0 });
    } catch (error) {
      console.error('Failed to submit request:', error);
      alert('Failed to submit request. Please try again.');
    }
  };

  const serviceTypes = [
    { value: 'vitals-check', label: 'Basic Vitals Check', icon: Stethoscope },
    { value: 'post-surgery-care', label: 'Post-Surgery Care', icon: CheckCircle },
    { value: 'medication-monitoring', label: 'Medication Monitoring', icon: FileText },
    { value: 'hospital-escort', label: 'Hospital Escort', icon: Navigation },
    { value: 'patient-education', label: 'Patient Education', icon: User }
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low', color: 'text-green-600', bgColor: 'bg-green-100' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    { value: 'high', label: 'High', color: 'text-red-600', bgColor: 'bg-red-100' }
  ];

  return (
    <div className={`p-4 md:p-8 space-y-8 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">Request Medical Assistant</h1>
        <p className={`mt-2 text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Get professional medical care at your home from verified medical assistants
        </p>
      </div>

      {/* Service Overview */}
      <div className={`p-6 rounded-xl border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center space-x-3 mb-4">
          <Stethoscope className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Available Services</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {serviceTypes.map((service) => {
            const Icon = service.icon;
            return (
              <div key={service.value} className={`p-4 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <Icon className="h-5 w-5 text-blue-600 mb-2" />
                <h3 className="font-medium">{service.label}</h3>
              </div>
            );
          })}
        </div>
      </div>

      {/* Request Form */}
      <div className={`p-6 rounded-xl border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h2 className="text-2xl font-bold mb-6">Request Form</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Type */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Service Required
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {serviceTypes.map((service) => {
                const Icon = service.icon;
                return (
                  <button
                    key={service.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, serviceType: service.value as any })}
                    className={`p-4 rounded-lg border transition-colors ${
                      formData.serviceType === service.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : darkMode
                        ? 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                        : 'border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{service.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <Calendar className="inline h-4 w-4 mr-1" />
                Preferred Date
              </label>
              <input
                type="date"
                required
                value={formData.visitDate}
                onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <Clock className="inline h-4 w-4 mr-1" />
                Preferred Time
              </label>
              <input
                type="time"
                required
                value={formData.visitTime}
                onChange={(e) => setFormData({ ...formData, visitTime: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>

          {/* Urgency Level */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <AlertTriangle className="inline h-4 w-4 mr-1" />
              Urgency Level
            </label>
            <div className="flex space-x-4">
              {urgencyLevels.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, urgency: level.value as any })}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    formData.urgency === level.value
                      ? `${level.bgColor} ${level.color} border-current`
                      : darkMode
                      ? 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                      : 'border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <MapPin className="inline h-4 w-4 mr-1" />
              Visit Location
            </label>
            
            <div className="space-y-4">
              <button
                type="button"
                onClick={detectLocation}
                disabled={locationLoading}
                className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                  locationLoading
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : locationDetected
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : darkMode
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {locationLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : locationDetected ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
                <span>
                  {locationLoading ? 'Detecting...' : locationDetected ? 'Location Detected' : 'Detect My Location'}
                </span>
              </button>

              {locationDetected && (
                <div className={`p-4 rounded-lg border ${
                  darkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-start space-x-3">
                    <MapPin className={`h-5 w-5 mt-0.5 ${
                      darkMode ? 'text-green-400' : 'text-green-600'
                    }`} />
                    <div>
                      <h5 className={`font-medium ${
                        darkMode ? 'text-green-300' : 'text-green-800'
                      }`}>
                        Location Detected
                      </h5>
                      <p className={`text-sm mt-1 ${
                        darkMode ? 'text-green-400' : 'text-green-700'
                      }`}>
                        {patientLocation.address}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Manual address input */}
              {!locationDetected && (
                <div>
                  <input
                    type="text"
                    placeholder="Enter your address manually"
                    value={patientLocation.address}
                    onChange={(e) => setPatientLocation({ ...patientLocation, address: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Additional Notes
            </label>
            <textarea
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Describe your symptoms, specific requirements, or any other details..."
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Submit Request
          </button>
        </form>
      </div>

      {/* Available Medical Assistants */}
      {medicalAssistants.length > 0 && (
        <div className={`p-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h2 className="text-xl font-semibold mb-4">Available Medical Assistants</h2>
          <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {medicalAssistants.length} verified medical assistant{medicalAssistants.length !== 1 ? 's' : ''} available in your area
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {medicalAssistants.slice(0, 3).map((assistant) => (
              <div key={assistant.id} className={`p-4 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <img
                    src={assistant.profileImage || 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=400'}
                    alt={assistant.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-medium">{assistant.name}</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {assistant.experience} experience
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 