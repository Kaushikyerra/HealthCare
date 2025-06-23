import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { 
  getMedicalVisitRequests, 
  createMedicalVisitRequest 
} from '../../services/apiService';
import { 
  Clipboard, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  PlusCircle 
} from 'lucide-react';
import GoogleMapReact from 'google-map-react';

// Marker component for Google Maps
const Marker: React.FC<{ lat: number; lng: number }> = () => <span role="img" aria-label="Patient">📍</span>;

interface MedicalVisitRequest {
  id: string;
  patientName: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export const MedicalAssistantDashboard: React.FC = () => {
  const { currentUser, darkMode, medicalVisitRequests, fetchMedicalVisitRequests, updateUser } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [available, setAvailable] = useState(currentUser?.available ?? false);

  useEffect(() => {
    fetchMedicalVisitRequests();
  }, [fetchMedicalVisitRequests]);

  useEffect(() => {
    setAvailable(currentUser?.available ?? false);
  }, [currentUser]);

  const handleToggleAvailable = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      await updateUser(currentUser.id, { available: !available });
      setAvailable(!available);
    } catch (e) {
      setError('Failed to update availability.');
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings for this medical assistant
  const myBookings = medicalVisitRequests.filter(req => req.medicalAssistantId === currentUser?.id);
  const today = new Date().toISOString().split('T')[0];
  const patientsVisitedToday = myBookings.filter(req => req.status === 'completed' && req.visitDate === today).length;
  const patientsVisitedTotal = myBookings.filter(req => req.status === 'completed').length;

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center">
            <Clipboard className="mr-3" /> Medical Assistant Dashboard
          </h1>
          <button 
            onClick={fetchMedicalVisitRequests}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
            }`}
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
        <div className="flex items-center space-x-6 mb-6">
          <div className="flex items-center">
            <span className="mr-2 font-medium">Available Today:</span>
            <button
              onClick={handleToggleAvailable}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${available ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'}`}
              disabled={loading}
            >
              {available ? 'Yes' : 'No'}
            </button>
          </div>
          <div className="font-medium">Visited Today: <span className="text-blue-500">{patientsVisitedToday}</span></div>
          <div className="font-medium">Total Visits: <span className="text-blue-500">{patientsVisitedTotal}</span></div>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Bookings List */}
          <div className={`rounded-lg shadow-md p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Clipboard className="mr-2" /> My Bookings
            </h2>
            {loading ? (
              <div className="text-center py-4">Loading bookings...</div>
            ) : myBookings.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No bookings yet
              </div>
            ) : (
              <div className="space-y-3">
                {myBookings.map((booking) => (
                  <div 
                    key={booking.id} 
                    className={`p-4 rounded-lg flex flex-col md:flex-row md:justify-between md:items-center ${
                      darkMode 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    } transition-colors`}
                  >
                    <div>
                      <h3 className="font-medium">{booking.patientName}</h3>
                      <p className="text-sm text-gray-500">{booking.patientAddress}</p>
                      <p className="text-xs text-gray-400">Visit Date: {booking.visitDate} | Status: {booking.status}</p>
                    </div>
                    {booking.patientLatitude && booking.patientLongitude && (
                      <div className="w-full md:w-48 h-32 mt-4 md:mt-0 md:ml-4 rounded-lg overflow-hidden border border-gray-300">
                        <GoogleMapReact
                          bootstrapURLKeys={{ key: 'AIzaSyANOZ03aeTc7ZFM90Z1tIxzZJbOnre3Vv4' }}
                          defaultCenter={{ lat: booking.patientLatitude, lng: booking.patientLongitude }}
                          defaultZoom={15}
                        >
                          <Marker lat={booking.patientLatitude} lng={booking.patientLongitude} />
                        </GoogleMapReact>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 