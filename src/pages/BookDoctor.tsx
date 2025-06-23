import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { UserCard } from '../components/Common/UserCard';
import { User } from '../types';
import { Search, Filter, Calendar, Clock, X } from 'lucide-react';

export const BookDoctor: React.FC = () => {
  const { users, currentUser, bookAppointment, darkMode, appointments, fetchAllAppointments } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<User | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null);
  const [appointmentData, setAppointmentData] = useState({
    notes: ''
  });

  // Fetch appointments on component mount
  useEffect(() => {
    fetchAllAppointments();
  }, [fetchAllAppointments]);

  const doctors = users.filter(user => user.role === 'doctor');
  const specializations = [...new Set(doctors.map(doctor => doctor.specialization).filter(Boolean))];

  // Simplified filter logic without location
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = !selectedSpecialization || doctor.specialization === selectedSpecialization;
    return matchesSearch && matchesSpecialization;
  });

  // Generate available slots for the next 7 days
  const getAvailableSlots = (doctor: User) => {
    if (!doctor.availableSlots || doctor.availableSlots.length === 0) {
      return [];
    }

    const slots: Array<{
      date: string;
      time: string;
      dayName: string;
      displayTime: string;
    }> = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const dateString = date.toISOString().split('T')[0];
      
      const daySlots = doctor.availableSlots.find(slot => slot.day === dayName);
      if (daySlots && daySlots.slots.length > 0) {
        daySlots.slots.forEach(time => {
          // Check if this slot is already booked
          const isBooked = appointments.some(apt => 
            apt.doctorId === doctor.id && 
            apt.date === dateString && 
            apt.time === time && 
            ['upcoming', 'ongoing'].includes(apt.status)
          );
          
          if (!isBooked) {
            slots.push({
              date: dateString,
              time,
              dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
              displayTime: time
            });
          }
        });
      }
    }
    
    return slots;
  };

  const handleBookAppointment = (doctor: User) => {
    setSelectedDoctor(doctor);
    setSelectedSlot(null);
  };

  const handleCloseModal = () => {
    setSelectedDoctor(null);
    setSelectedSlot(null);
    setAppointmentData({ notes: '' });
  };

  const handleConfirmBooking = async () => {
    if (!selectedDoctor || !currentUser || !selectedSlot) {
      alert('Please select a time slot.');
      return;
    }

    try {
      const appointmentToCreate = {
        patientId: currentUser.id,
        patientName: currentUser.name,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        date: selectedSlot.date,
        time: selectedSlot.time,
        status: 'upcoming' as const,
        type: 'doctor' as const,
        location: selectedDoctor.address || 'Online',
        notes: appointmentData.notes,
      };
      
      await bookAppointment(appointmentToCreate);
      alert('Appointment booked successfully!');
      handleCloseModal();
    } catch (error) {
      console.error('Failed to book appointment:', error);
      alert('Failed to book appointment. Please try again.');
    }
  };

  return (
    <div className={`p-4 md:p-8 space-y-8 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">Book a Doctor</h1>
        <p className={`mt-2 text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Find and book appointments with qualified healthcare professionals
        </p>
      </div>

      {/* Search and Filters */}
      <div className={`p-6 rounded-xl border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative md:col-span-1">
            <Search className={`absolute left-3 top-3 h-5 w-5 ${
              darkMode ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Specialization Filter */}
          <div className="relative md:col-span-1">
            <Filter className={`absolute left-3 top-3 h-5 w-5 ${
              darkMode ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">All Specializations</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedSpecialization('');
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

      {/* Doctors List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDoctors.map((doctor) => (
          <UserCard
            key={doctor.id}
            user={doctor}
            onAction={handleBookAppointment}
            actionLabel="Book Appointment"
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredDoctors.length === 0 && (
        <div className={`text-center py-16 px-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h2 className="text-xl font-semibold mb-2">No Doctors Found</h2>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      {/* Booking Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-8 rounded-xl w-full max-w-2xl mx-4 border max-h-[90vh] overflow-y-auto ${
            darkMode 
              ? 'bg-gray-800 border-gray-700 text-white' 
              : 'bg-white border-gray-200 text-gray-900'
          }`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Book Appointment</h2>
              <button onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>
            
            <p className="mb-4">
              You are booking an appointment with <strong className="font-semibold">{selectedDoctor.name}</strong> ({selectedDoctor.specialization}).
            </p>

            {/* Available Slots */}
            <div className="mb-6">
              <h3 className={`text-lg font-semibold mb-4 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Available Time Slots
              </h3>
              
              {selectedDoctor.availableSlots && selectedDoctor.availableSlots.length > 0 ? (
                <div className="space-y-4">
                  {getAvailableSlots(selectedDoctor).map((slot) => (
                    <button
                      key={`${slot.date}-${slot.time}`}
                      onClick={() => setSelectedSlot({ date: slot.date, time: slot.time })}
                      className={`w-full p-4 rounded-lg border transition-colors ${
                        selectedSlot?.date === slot.date && selectedSlot?.time === slot.time
                          ? 'bg-blue-600 text-white border-blue-600'
                          : darkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                          : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5" />
                          <span className="font-medium">{slot.dayName}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Clock className="h-5 w-5" />
                          <span className="font-medium">{slot.displayTime}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className={`p-4 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}>
                  <p className={`text-center ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    No available slots found for this doctor.
                  </p>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Reason for appointment (optional)
              </label>
              <textarea
                placeholder="Describe your symptoms or reason for visit..."
                value={appointmentData.notes}
                onChange={(e) => setAppointmentData({ ...appointmentData, notes: e.target.value })}
                rows={3}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              ></textarea>
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleConfirmBooking}
              disabled={!selectedSlot}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selectedSlot ? `Confirm Booking for ${selectedSlot.date} at ${selectedSlot.time}` : 'Select a time slot'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};