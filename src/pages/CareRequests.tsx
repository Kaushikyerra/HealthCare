import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Heart, Search, Calendar, MessageSquare, Check, X, Clock } from 'lucide-react';

export const CareRequests: React.FC = () => {
  const { currentUser, caretakerRequests, updateCaretakerRequest, darkMode } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  if (!currentUser) return null;

  // Get requests for current caretaker
  const userRequests = caretakerRequests.filter(req => req.caretakerId === currentUser.id);

  const filteredRequests = userRequests.filter(req => {
    const matchesSearch = req.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
    setActionLoading(requestId + status);
    setActionError('');
    setActionSuccess('');
    try {
      await updateCaretakerRequest(requestId, status);
      setActionSuccess(`Request ${status === 'accepted' ? 'accepted' : 'rejected'} successfully.`);
    } catch (e) {
      setActionError('Failed to update request. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = userRequests.filter(req => req.status === 'pending').length;
  const acceptedCount = userRequests.filter(req => req.status === 'accepted').length;
  const rejectedCount = userRequests.filter(req => req.status === 'rejected').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Care Requests
        </h1>
        <p className={`text-lg mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage incoming care requests from patients
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`p-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Requests
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {userRequests.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Heart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Pending
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {pendingCount}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Accepted
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {acceptedCount}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Check className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Rejected
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {rejectedCount}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <X className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`p-6 rounded-xl border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className={`absolute left-3 top-3 h-5 w-5 ${
              darkMode ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
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

      {/* Requests List */}
      {filteredRequests.length > 0 ? (
        <div className="space-y-6">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className={`p-6 rounded-xl border ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Heart className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Care Request from {request.patientName}
                    </h3>
                    <div className={`flex items-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                      <Calendar size={14} className="mr-1" />
                      Requested on {request.requestDate}
                    </div>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  request.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : request.status === 'accepted'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {request.startDate && (
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Start Date
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {request.startDate}
                    </p>
                  </div>
                )}

                {request.duration && (
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Duration
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {request.duration}
                    </p>
                  </div>
                )}

                {request.careType && (
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Care Type
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {request.careType}
                    </p>
                  </div>
                )}
              </div>

              {request.message && (
                <div className={`p-3 rounded-lg mb-4 ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className={`flex items-center text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <MessageSquare size={14} className="mr-1" />
                    Patient Message
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {request.message}
                  </p>
                </div>
              )}

              {request.status === 'pending' && (
                <div className="flex space-x-3">
                  {actionError && <div className="text-red-500 text-sm mb-2">{actionError}</div>}
                  {actionSuccess && <div className="text-green-600 text-sm mb-2">{actionSuccess}</div>}
                  <button
                    onClick={() => handleUpdateRequest(request.id, 'accepted')}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    disabled={actionLoading === request.id + 'accepted'}
                  >
                    {actionLoading === request.id + 'accepted' ? 'Accepting...' : (<><Check size={16} className="mr-2" />Accept Request</>)}
                  </button>
                  <button
                    onClick={() => handleUpdateRequest(request.id, 'rejected')}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    disabled={actionLoading === request.id + 'rejected'}
                  >
                    {actionLoading === request.id + 'rejected' ? 'Rejecting...' : (<><X size={16} className="mr-2" />Reject Request</>)}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={`text-center py-16 px-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <Heart size={48} className={`mx-auto mb-4 ${
            darkMode ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <h3 className={`text-xl font-semibold mb-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            No care requests found
          </h3>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            {userRequests.length === 0 
              ? 'You have no care requests yet. Requests from patients will appear here.'
              : 'Try adjusting your search or filter criteria to find specific requests.'
            }
          </p>
        </div>
      )}
    </div>
  );
};