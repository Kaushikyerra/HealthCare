import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { 
  Heart, 
  Users, 
  Calendar, 
  Pill, 
  Shield, 
  Zap,
  ArrowRight,
  Star,
  CheckCircle,
  Stethoscope,
  UserPlus
} from 'lucide-react';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { darkMode, initializeSampleData } = useStore();

  React.useEffect(() => {
    initializeSampleData();
  }, [initializeSampleData]);

  const features = [
    {
      icon: Users,
      title: 'Connect with Professionals',
      description: 'Find qualified doctors and experienced caretakers in your area',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      icon: Calendar,
      title: 'Easy Appointment Booking',
      description: 'Schedule appointments with doctors and caretakers seamlessly',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      icon: Pill,
      title: 'Medication Management',
      description: 'Track prescriptions and get reminders for medication intake',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your health information is protected with enterprise-grade security',
      color: 'from-orange-500 to-red-600'
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Get instant notifications about appointments and care updates',
      color: 'from-yellow-500 to-orange-600'
    },
    {
      icon: Heart,
      title: 'Comprehensive Care',
      description: 'Complete healthcare ecosystem for patients, doctors, and caretakers',
      color: 'from-rose-500 to-pink-600'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Patient',
      rating: 5,
      text: 'Heal Together made it so easy to find a qualified caretaker for my elderly mother. The platform is intuitive and the professionals are top-notch.',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Doctor',
      rating: 5,
      text: 'As a pediatrician, this platform helps me manage my practice efficiently and stay connected with my patients.',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      name: 'Emma Rodriguez',
      role: 'Caretaker',
      rating: 5,
      text: 'The platform connects me with families who need care services. It\'s professional and makes scheduling so much easier.',
      color: 'from-purple-500 to-pink-600'
    }
  ];

  const roleCards = [
    {
      role: 'patient',
      title: 'For Patients',
      description: 'Book appointments, track medications, and connect with healthcare professionals',
      icon: Heart,
      color: 'from-emerald-500 to-teal-600',
      features: ['Book Doctor Appointments', 'Request Caretakers', 'Track Medications', 'AI Symptom Checker']
    },
    {
      role: 'doctor',
      title: 'For Doctors',
      description: 'Manage patients, prescribe medications, and streamline your practice',
      icon: Stethoscope,
      color: 'from-blue-500 to-indigo-600',
      features: ['Patient Management', 'Digital Prescriptions', 'Appointment Scheduling', 'Medical Records']
    },
    {
      role: 'caretaker',
      title: 'For Caretakers',
      description: 'Connect with patients, manage care requests, and grow your practice',
      icon: UserPlus,
      color: 'from-purple-500 to-pink-600',
      features: ['Care Requests', 'Patient Profiles', 'Schedule Management', 'Professional Network']
    }
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-600"></div>
        <div className="relative z-10">
          {/* Navigation */}
          <nav className="flex items-center justify-between p-6 lg:px-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Heal Together</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="text-white/90 hover:text-white font-medium transition-colors px-4 py-2 rounded-xl hover:bg-white/10"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="bg-white text-blue-600 px-6 py-2 rounded-xl font-medium hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Get Started
              </button>
            </div>
          </nav>

          {/* Hero Section */}
          <div className="px-6 py-24 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-8">
                Healthcare That
                <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                  Connects & Cares
                </span>
              </h1>
              <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
                Join thousands of patients, doctors, and caretakers who trust Heal Together 
                for comprehensive healthcare management and coordination.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/register')}
                  className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all duration-200 flex items-center justify-center group shadow-xl hover:shadow-2xl"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 backdrop-blur-sm transition-all duration-200"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Role Cards Section */}
      <section className={`py-24 ${darkMode ? 'bg-gray-800' : 'bg-slate-50'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Built for Every Healthcare Role
            </h2>
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}>
              Whether you're seeking care, providing treatment, or offering support, 
              Heal Together has the tools you need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {roleCards.map((card, index) => (
              <div
                key={index}
                className={`p-8 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                  darkMode 
                    ? 'bg-gray-900 border border-gray-700' 
                    : 'bg-white border border-gray-200'
                }`}
              >
                <div className={`p-4 bg-gradient-to-r ${card.color} rounded-2xl w-fit mb-6 shadow-lg`}>
                  <card.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {card.title}
                </h3>
                <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {card.description}
                </p>
                <ul className="space-y-3">
                  {card.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <CheckCircle className={`h-5 w-5 mr-3 bg-gradient-to-r ${card.color} bg-clip-text text-transparent`} />
                      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`py-24 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Powerful Features for Better Healthcare
            </h2>
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}>
              Our comprehensive platform brings together all the tools and connections 
              you need for effective healthcare management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  darkMode 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-slate-50 border border-gray-200'
                }`}
              >
                <div className={`p-3 bg-gradient-to-r ${feature.color} rounded-xl w-fit mb-4 shadow-lg`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className={`text-xl font-semibold mb-3 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {feature.title}
                </h3>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-16 ${darkMode ? 'bg-gray-800' : 'bg-slate-50'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent mb-2">
                10,000+
              </div>
              <div className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Active Users
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent mb-2">
                500+
              </div>
              <div className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Healthcare Professionals
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent mb-2">
                50,000+
              </div>
              <div className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Appointments Scheduled
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={`py-24 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Trusted by Healthcare Community
            </h2>
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              See what our users have to say about their experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`p-8 rounded-2xl transition-all duration-300 hover:shadow-xl ${
                  darkMode 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-slate-50 border border-gray-200'
                }`}
              >
                <div className="flex items-center mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                  "{testimonial.text}"
                </p>
                <div className="flex items-center">
                  <div className={`w-12 h-12 bg-gradient-to-r ${testimonial.color} rounded-full flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-semibold text-lg">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-4">
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {testimonial.name}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-16 ${darkMode ? 'bg-gray-800' : 'bg-slate-50'}`}>
        <div className="max-w-4xl mx-auto text-center px-6 lg:px-8">
          <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className={`text-lg mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Join Heal Together today and discover a better way to manage your health and connect with care professionals.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-200 inline-flex items-center group"
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 border-t ${
        darkMode 
          ? 'bg-gray-900 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className={`text-xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Heal Together
              </span>
            </div>
            
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              © 2025 Heal Together. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};