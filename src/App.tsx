import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { useStore } from './store/useStore';
import { getCurrentUser } from './services/authService';
import { Layout } from './components/Layout/Layout';
import { MongoDBTest } from './components/MongoDBTest';

// Pages
import { Landing } from './pages/Landing';
import { RegisterForm } from './components/Auth/RegisterForm';
import { LoginForm } from './components/Auth/LoginForm';
import { Dashboard } from './pages/Dashboard';
import { BookDoctor } from './pages/BookDoctor';
import { Appointments } from './pages/Appointments';
import { RequestCaretaker } from './pages/RequestCaretaker';
import { RequestMedicalAssistant } from './pages/RequestMedicalAssistant';
import { Medications } from './pages/Medications';
import { Chatbot } from './pages/Chatbot';
import { MedicalRecords } from './pages/MedicalRecords';
import { Patients } from './pages/Patients';
import { Prescriptions } from './pages/Prescriptions';
import { CareRequests } from './pages/CareRequests';
import { Profile } from './pages/Profile';

// Lazy load pages
const PatientDashboardLazy = lazy(() => import('./components/Dashboard/PatientDashboard').then(module => ({ default: module.default })));
const SettingsLazy = lazy(() => import('./components/Settings/Settings'));

// Error Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) => {
  return (
    <div role="alert" className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
        <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4 text-sm text-gray-700 dark:text-gray-300 overflow-x-auto">
          {error.message}
        </pre>
        <button 
          onClick={resetErrorBoundary}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Try again
        </button>
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useStore();
  return currentUser ? <>{children}</> : <Navigate to="/login" />;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useStore();
  return currentUser ? <Navigate to="/dashboard" /> : <>{children}</>;
};

function App() {
  const { darkMode, setCurrentUser, fetchUsers } = useStore();
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for existing JWT token and validate it
        const token = localStorage.getItem('authToken');
        if (token) {
          // Get current user data from API
          const userData = await getCurrentUser();
          if (userData) {
            setCurrentUser(userData);
            // Only fetch data after user is authenticated
            try {
              await fetchUsers();
            } catch (error) {
              console.error('Error fetching users:', error);
              // Don't fail the entire auth process if fetching users fails
            }
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('authToken');
            setCurrentUser(null);
            console.log('Invalid token removed, user logged out');
          }
        } else {
          // No token, user is not authenticated
          setCurrentUser(null);
          console.log('No auth token found, user not authenticated');
        }
      } catch (error) {
        console.error('Authentication initialization error:', error);
        // Clear any invalid tokens
        localStorage.removeItem('authToken');
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [setCurrentUser, fetchUsers]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset the state of your app here
        window.location.reload();
      }}
    >
      <Router>
        <div className={darkMode ? 'dark' : ''}>
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
              </div>
            </div>
          }>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><RegisterForm /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><LoginForm /></PublicRoute>} />
              <Route path="/test-mongodb" element={<MongoDBTest />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/book-doctor" element={
                <ProtectedRoute>
                  <Layout>
                    <BookDoctor />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/appointments" element={
                <ProtectedRoute>
                  <Layout>
                    <Appointments />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/request-caretaker" element={
                <ProtectedRoute>
                  <Layout>
                    <RequestCaretaker />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/request-medical-assistant" element={
                <ProtectedRoute>
                  <Layout>
                    <RequestMedicalAssistant />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/medications" element={
                <ProtectedRoute>
                  <Layout>
                    <Medications />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/chatbot" element={
                <ProtectedRoute>
                  <Layout>
                    <Chatbot />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/records" element={
                <ProtectedRoute>
                  <Layout>
                    <MedicalRecords />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/patients" element={
                <ProtectedRoute>
                  <Layout>
                    <Patients />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/prescriptions" element={
                <ProtectedRoute>
                  <Layout>
                    <Prescriptions />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/care-requests" element={
                <ProtectedRoute>
                  <Layout>
                    <CareRequests />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/patient-dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <PatientDashboardLazy />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/patient-settings" element={
                <ProtectedRoute>
                  <Layout>
                    <SettingsLazy />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/doctor-settings" element={
                <ProtectedRoute>
                  <Layout>
                    <SettingsLazy />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/caretaker-settings" element={
                <ProtectedRoute>
                  <Layout>
                    <SettingsLazy />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/medical-assistant-settings" element={
                <ProtectedRoute>
                  <Layout>
                    <SettingsLazy />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Layout>
                    <SettingsLazy />
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;