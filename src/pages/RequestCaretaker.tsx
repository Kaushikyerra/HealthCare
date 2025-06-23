import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { UserCard } from '../components/Common/UserCard';
import { User } from '../types';
import { Search, Filter, Users, X, Calendar, Clock, MessageSquare } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const RequestCaretaker: React.FC = () => {
  const { users, currentUser, requestCaretaker, darkMode } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedCaretaker, setSelectedCaretaker] = useState<User | null>(null);
  const [requestData, setRequestData] = useState({
    startDate: '',
    duration: '',
    careType: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const caretakers = users.filter(user => user.role === 'caretaker');
  const languages = [...new Set(caretakers.flatMap(c => c.languages || []))];

  const filteredCaretakers = caretakers.filter(caretaker => {
    const matchesSearch = caretaker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caretaker.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = !selectedGender || caretaker.gender === selectedGender;
    const matchesLanguage = !selectedLanguage || caretaker.languages?.includes(selectedLanguage);
    return matchesSearch && matchesGender && matchesLanguage;
  });

  const handleRequestCaretaker = (caretaker: User) => {
    setSelectedCaretaker(caretaker);
  };

  const handleConfirmRequest = async () => {
    if (!selectedCaretaker || !currentUser) return;
    if (!requestData.startDate || !requestData.duration || !requestData.careType) {
      setError('Please fill all required fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const request = {
        patientId: currentUser.id,
        patientName: currentUser.name,
        caretakerId: selectedCaretaker.id,
        caretakerName: selectedCaretaker.name,
        status: 'pending' as const,
        requestDate: new Date().toISOString().split('T')[0],
        startDate: requestData.startDate,
        duration: requestData.duration,
        careType: requestData.careType,
        message: requestData.message
      };
      await requestCaretaker(request);
      setSuccess(true);
      setSelectedCaretaker(null);
      setRequestData({ startDate: '', duration: '', careType: '', message: '' });
    } catch (e) {
      setError('Failed to send request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Request Caretaker
        </h1>
        <p className={`text-lg mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Find and request professional caretakers for your healthcare needs
        </p>
      </div>

      {/* Search and Filters */}
      <div className={`p-6 rounded-xl border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className={`absolute left-3 top-3 h-5 w-5 ${
              darkMode ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Search caretakers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          <div className="relative">
            <Filter className={`absolute left-3 top-3 h-5 w-5 ${
              darkMode ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="relative">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">All Languages</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedGender('');
              setSelectedLanguage('');
            }}
            className={`px-4 py-2 border rounded-lg transition-colors ${
              darkMode
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Caretakers List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCaretakers.map((caretaker) => (
          <UserCard
            key={caretaker.id}
            user={caretaker}
            onAction={handleRequestCaretaker}
            actionLabel="Request Caretaker"
            showFullProfile={true}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredCaretakers.length === 0 && (
        <div className={`text-center py-16 px-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <Users size={48} className={`mx-auto mb-4 ${
            darkMode ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <h3 className={`text-xl font-semibold mb-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            No caretakers found
          </h3>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            Try adjusting your search terms or filters to find available caretakers.
          </p>
        </div>
      )}

      {/* Request Modal */}
      {selectedCaretaker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className={`w-full max-w-md rounded-xl shadow-xl ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-semibold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Request Caretaker
                </h3>
                <button
                  onClick={() => setSelectedCaretaker(null)}
                  className={`p-2 rounded-lg ${
                    darkMode
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedCaretaker.profileImage || 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400'}
                    alt={selectedCaretaker.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedCaretaker.name}
                    </h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {selectedCaretaker.experience} experience
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={requestData.startDate}
                    onChange={(e) => setRequestData({...requestData, startDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <Clock className="inline h-4 w-4 mr-1" />
                    Duration
                  </label>
                  <select
                    value={requestData.duration}
                    onChange={(e) => setRequestData({...requestData, duration: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                  >
                    <option value="">Select duration</option>
                    <option value="1 day">1 day</option>
                    <option value="3 days">3 days</option>
                    <option value="1 week">1 week</option>
                    <option value="2 weeks">2 weeks</option>
                    <option value="1 month">1 month</option>
                    <option value="Ongoing">Ongoing</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Care Type
                  </label>
                  <select
                    value={requestData.careType}
                    onChange={(e) => setRequestData({...requestData, careType: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                  >
                    <option value="">Select care type</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Medical Care">Medical Care</option>
                    <option value="Companionship">Companionship</option>
                    <option value="Post-Surgery Care">Post-Surgery Care</option>
                    <option value="Elderly Care">Elderly Care</option>
                    <option value="Disability Support">Disability Support</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <MessageSquare className="inline h-4 w-4 mr-1" />
                    Message (Optional)
                  </label>
                  <textarea
                    value={requestData.message}
                    onChange={(e) => setRequestData({...requestData, message: e.target.value})}
                    rows={3}
                    placeholder="Describe your care needs..."
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>

              {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
              {success && (
                <div className="text-green-600 text-sm mb-2 flex flex-col items-center">
                  Caretaker request sent successfully!
                  <a href="/care-requests" className="underline text-blue-600 mt-1">View My Requests</a>
                </div>
              )}

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setSelectedCaretaker(null)}
                  className={`flex-1 px-4 py-2 border rounded-lg font-medium transition-colors ${
                    darkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRequest}
                  disabled={!requestData.startDate || !requestData.duration || !requestData.careType || loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};