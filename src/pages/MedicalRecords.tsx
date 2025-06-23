import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { AppointmentCard } from '../components/Common/AppointmentCard';
import { FileText, Calendar, Search, Filter, Download } from 'lucide-react';

export const MedicalRecords: React.FC = () => {
  const { currentUser, appointments, darkMode } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  if (!currentUser) return null;

  const userAppointments = appointments.filter(apt => apt.patientId === currentUser.id);
  const completedAppointments = userAppointments.filter(apt => apt.status === 'completed');

  const filteredRecords = completedAppointments.filter(apt => {
    const matchesSearch = apt.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.caretakerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || apt.type === filterType;
    
    const matchesDateRange = (!dateRange.start || apt.date >= dateRange.start) &&
                            (!dateRange.end || apt.date <= dateRange.end);
    
    return matchesSearch && matchesType && matchesDateRange;
  });

  const totalPrescriptions = completedAppointments.reduce((total, apt) => 
    total + (apt.prescriptions?.length || 0), 0
  );

  const handleExportRecords = () => {
    const recordsData = filteredRecords.map(record => ({
      Date: record.date,
      Time: record.time,
      Type: record.type,
      Provider: record.doctorName || record.caretakerName,
      Location: record.location,
      Status: record.status,
      Prescriptions: record.prescriptions?.length || 0,
      Notes: record.notes || 'No notes'
    }));

    const csvContent = [
      Object.keys(recordsData[0] || {}).join(','),
      ...recordsData.map(record => Object.values(record).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical-records-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Medical Records
          </h1>
          <p className={`text-lg mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            View and manage your complete medical history
          </p>
        </div>
        
        {filteredRecords.length > 0 && (
          <button
            onClick={handleExportRecords}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download size={16} className="mr-2" />
            Export Records
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Records
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {completedAppointments.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Doctor Visits
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {completedAppointments.filter(apt => apt.type === 'doctor').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Prescriptions
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {totalPrescriptions}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`p-6 rounded-xl border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className={`absolute left-3 top-3 h-5 w-5 ${
              darkMode ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Search records..."
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
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Types</option>
              <option value="doctor">Doctor Visits</option>
              <option value="caretaker">Caretaker Sessions</option>
            </select>
          </div>

          <div>
            <input
              type="date"
              placeholder="Start Date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          <div>
            <input
              type="date"
              placeholder="End Date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          <button
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
              setDateRange({ start: '', end: '' });
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

      {/* Records List */}
      {filteredRecords.length > 0 ? (
        <div className="space-y-6">
          <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Medical History ({filteredRecords.length} records)
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRecords.map((record) => (
              <AppointmentCard
                key={record.id}
                appointment={record}
                showActions={false}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className={`text-center py-16 px-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <FileText size={48} className={`mx-auto mb-4 ${
            darkMode ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <h3 className={`text-xl font-semibold mb-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            No medical records found
          </h3>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            {completedAppointments.length === 0 
              ? 'You have no completed appointments yet. Your medical records will appear here after completing appointments.'
              : 'Try adjusting your search or filter criteria to find specific records.'
            }
          </p>
        </div>
      )}
    </div>
  );
};