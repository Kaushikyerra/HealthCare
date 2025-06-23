import React, { useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  FileText,
  Bell,
  Plus,
  TrendingUp,
  Shield,
  Users,
  Calendar,
  MessageSquare,
  Phone,
  MapPin,
  Thermometer,
  Droplets,
  Pill
} from 'lucide-react';

export const CaretakerDashboard: React.FC = () => {
  const { 
    currentUser, 
    appointments, 
    users, 
    darkMode,
    caretakerRequests,
    fetchUsers,
    fetchUserAppointments,
    fetchCaretakerRequests,
    refreshAllData,
    loading
  } = useStore();

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
      fetchUserAppointments();
      fetchCaretakerRequests();
    }
  }, [currentUser, fetchUsers, fetchUserAppointments, fetchCaretakerRequests]);

  // Auto-refresh data every 30 seconds for real-time updates
  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(() => {
      refreshAllData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [currentUser, refreshAllData]);

  if (!currentUser) return null;

  // Get caretaker's assigned patients (from patient's caretakerId field)
  const assignedPatients = users.filter(user => 
    user.role === 'patient' && 
    (user as any).caretakerId === currentUser.id
  );

  // Get appointments for assigned patients
  const patientAppointments = appointments.filter(apt => 
    assignedPatients.some(patient => patient.id === apt.patientId)
  );

  // Get today's care tasks
  const today = new Date().toISOString().split('T')[0];
  const todaysTasks = patientAppointments.filter(apt => apt.date === today);

  // Get upcoming appointments for assigned patients
  const upcomingAppointments = patientAppointments.filter(apt => apt.status === 'upcoming');

  // Get completed appointments
  const completedAppointments = patientAppointments.filter(apt => apt.status === 'completed');

  // Get pending care requests
  const pendingCareRequests = caretakerRequests.filter(req => 
    req.caretakerId === currentUser.id && req.status === 'pending'
  );

  // Get accepted care requests
  const acceptedCareRequests = caretakerRequests.filter(req => 
    req.caretakerId === currentUser.id && req.status === 'accepted'
  );

  // Get recent activities
  const recentActivities = [
    ...patientAppointments.map(apt => ({
      id: apt.id,
      type: 'appointment',
      title: `Care session with ${users.find(u => u.id === apt.patientId)?.name || 'Patient'}`,
      date: apt.date,
      time: apt.time,
      status: apt.status,
      description: apt.notes || 'Care session'
    })),
    ...caretakerRequests.map(req => ({
      id: req.id,
      type: 'request',
      title: `Care request from ${users.find(u => u.id === req.patientId)?.name || 'Patient'}`,
      date: req.requestDate,
      time: '',
      status: req.status,
      description: req.message || `Request for ${req.careType || 'care services'}`
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className={`p-8 rounded-xl ${
        darkMode ? 'bg-gradient-to-br from-emerald-900 to-emerald-800' : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
      } text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {currentUser.name.split(' ')[0]}!
            </h1>
            <p className="text-emerald-100 text-lg">
              Providing compassionate care to {assignedPatients.length} patients
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-100 text-sm">Real-time synchronized</span>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={refreshAllData}
              disabled={loading.users || loading.appointments || loading.caretakerRequests}
              className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all disabled:opacity-50"
              title="Refresh data"
            >
              <Activity size={20} />
            </button>
            <div className="p-4 bg-white bg-opacity-20 rounded-full">
              <Heart size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`p-6 rounded-xl border ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Assigned Patients
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {assignedPatients.length}
              </p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <Users className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Today's Tasks
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {todaysTasks.length}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Pending Requests
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {pendingCareRequests.length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Completed Today
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {todaysTasks.filter(task => task.status === 'completed').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/patients"
            className={`p-6 rounded-xl border transition-all duration-200 hover:shadow-lg group ${
              darkMode 
                ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-emerald-100 group-hover:bg-emerald-200 transition-colors">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  My Patients
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  View assigned patients
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/care-tasks"
            className={`p-6 rounded-xl border transition-all duration-200 hover:shadow-lg group ${
              darkMode 
                ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Care Tasks
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Manage daily tasks
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/monitoring"
            className={`p-6 rounded-xl border transition-all duration-200 hover:shadow-lg group ${
              darkMode 
                ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Health Monitoring
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Track vital signs
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/reports"
            className={`p-6 rounded-xl border transition-all duration-200 hover:shadow-lg group ${
              darkMode 
                ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-red-100 group-hover:bg-red-200 transition-colors">
                <FileText className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Care Reports
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Generate reports
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Assigned Patients */}
      <div>
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          My Patients
        </h2>
        <div className={`rounded-xl border ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          {assignedPatients.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {assignedPatients.map((patient) => {
                const patientAppts = patientAppointments.filter(apt => apt.patientId === patient.id);
                const todaysPatientTasks = todaysTasks.filter(task => task.patientId === patient.id);
                const upcomingPatientAppointments = upcomingAppointments.filter(apt => apt.patientId === patient.id);
                const patientAcceptedRequests = acceptedCareRequests.filter(req => req.patientId === patient.id);
                const patientPrescriptions = patientAppts
                  .filter(apt => apt.prescriptions && apt.prescriptions.length > 0)
                  .flatMap(apt => apt.prescriptions || []);
                
                return (
                  <div key={patient.id} className="p-6">
                    <div className="space-y-4">
                      {/* Patient Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {patient.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {patient.name}
                            </p>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {todaysPatientTasks.length} tasks today • {upcomingPatientAppointments.length} upcoming appointments
                            </p>
                            {patientAcceptedRequests.length > 0 && (
                              <p className="text-xs text-green-600 font-medium mt-1">
                                ✓ Care request accepted
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/patients/${patient.id}`}
                            className="p-2 bg-emerald-100 rounded-lg hover:bg-emerald-200 transition-colors"
                          >
                            <User className="h-4 w-4 text-emerald-600" />
                          </Link>
                          <Link
                            to={`/patients/${patient.id}/care`}
                            className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            <Heart className="h-4 w-4 text-blue-600" />
                          </Link>
                          <button className="p-2 bg-green-100 rounded-lg hover:bg-green-200 transition-colors">
                            <Phone className="h-4 w-4 text-green-600" />
                          </button>
                        </div>
                      </div>

                      {/* Patient Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-16">
                        {/* Upcoming Appointments */}
                        <div className={`p-3 rounded-lg border ${
                          darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Upcoming Appointments
                          </h4>
                          {upcomingPatientAppointments.length > 0 ? (
                            <div className="space-y-1">
                              {upcomingPatientAppointments.slice(0, 2).map((apt, index) => (
                                <div key={index} className="text-xs">
                                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {apt.date} at {apt.time}
                                  </p>
                                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {apt.type === 'doctor' ? 'Doctor' : 'Care'} appointment
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              No upcoming appointments
                            </p>
                          )}
                        </div>

                        {/* Active Prescriptions */}
                        <div className={`p-3 rounded-lg border ${
                          darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Active Prescriptions
                          </h4>
                          {patientPrescriptions.length > 0 ? (
                            <div className="space-y-1">
                              {patientPrescriptions.slice(0, 2).map((prescription, index) => (
                                <div key={index} className="text-xs">
                                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {prescription.medicine}
                                  </p>
                                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {prescription.dosage} • {prescription.duration}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              No active prescriptions
                            </p>
                          )}
                        </div>

                        {/* Care Tasks */}
                        <div className={`p-3 rounded-lg border ${
                          darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Today's Tasks
                          </h4>
                          {todaysPatientTasks.length > 0 ? (
                            <div className="space-y-1">
                              {todaysPatientTasks.slice(0, 2).map((task, index) => (
                                <div key={index} className="text-xs">
                                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {task.time} - {task.type || 'Care task'}
                                  </p>
                                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {task.location}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-8 text-center">
                              <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                              <p className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                No care tasks today
                              </p>
                              <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                All tasks are completed or scheduled for later
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                No patients assigned yet
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Patients will be assigned to you when they book appointments or request care
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Today's Care Tasks */}
      <div>
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Today's Care Tasks
        </h2>
        <div className={`rounded-xl border ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          {todaysTasks.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {todaysTasks.map((task, index) => {
                const patient = users.find(user => user.id === task.patientId);
                return (
                  <div key={index} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${
                          task.status === 'completed' ? 'bg-green-100' :
                          task.status === 'upcoming' ? 'bg-blue-100' :
                          'bg-orange-100'
                        }`}>
                          <Activity className={`h-5 w-5 ${
                            task.status === 'completed' ? 'text-green-600' :
                            task.status === 'upcoming' ? 'text-blue-600' :
                            'text-orange-600'
                          }`} />
                        </div>
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {patient?.name || 'Patient'} - {task.type || 'Care Task'}
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {task.time} - {task.location}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          task.status === 'completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {task.status}
                        </span>
                        {task.status === 'upcoming' && (
                          <button className="p-2 bg-emerald-100 rounded-lg hover:bg-emerald-200 transition-colors">
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                No care tasks today
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                All tasks are completed or scheduled for later
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};