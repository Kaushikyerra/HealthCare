# Heal Together - Healthcare Management Platform

A comprehensive healthcare management platform that connects patients, doctors, and caretakers. Built with React, TypeScript, and MongoDB.

## Features

- **Multi-role Support**: Patients, Doctors, and Caretakers
- **Appointment Management**: Book and manage appointments
- **Caretaker Requests**: Request and manage caretaker services
- **Medication Tracking**: Track medication intake and prescriptions
- **Medical Records**: Manage and view medical records
- **Real-time Chat**: AI-powered chatbot for health queries
- **Dark Mode**: Toggle between light and dark themes

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Database**: MongoDB
- **Authentication**: JWT with bcrypt
- **Routing**: React Router DOM

## Migration from Firebase to MongoDB

This project has been migrated from Firebase to MongoDB. The following changes were made:

### Removed Firebase Dependencies
- Firebase Authentication
- Firestore Database
- Firebase Analytics
- Firebase configuration files

### Added MongoDB Dependencies
- `mongodb`: MongoDB driver for Node.js
- `bcryptjs`: Password hashing
- `jsonwebtoken`: JWT authentication
- `@types/bcryptjs` and `@types/jsonwebtoken`: TypeScript types

### Key Changes
1. **Authentication**: Replaced Firebase Auth with JWT-based authentication
2. **Database**: Replaced Firestore with MongoDB collections
3. **Real-time Updates**: Removed Firebase real-time listeners (can be replaced with WebSockets if needed)
4. **Configuration**: Updated environment variables for MongoDB connection

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the project root with the following variables:
   ```env
   # MongoDB Connection
   VITE_MONGODB_URI=mongodb://localhost:27017
   VITE_MONGODB_DB_NAME=heal-together
   
   # JWT Secret (change this to a secure random string in production)
   VITE_JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

4. **Set up MongoDB**
   - Install MongoDB locally or use MongoDB Atlas
   - Create a database named `heal-together`
   - The application will automatically create the necessary collections

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## Database Schema

### Collections

1. **users**: User accounts with role-based access
2. **appointments**: Medical appointments between patients and doctors/caretakers
3. **caretakerRequests**: Requests for caretaker services
4. **medicationIntakes**: Medication tracking records

### User Roles

- **Patient**: Can book appointments, request caretakers, track medications
- **Doctor**: Can manage patients, appointments, and prescriptions
- **Caretaker**: Can accept care requests and manage patient care

## API Endpoints

The application uses a service-based architecture with the following main services:

- `authService.ts`: Authentication and user management
- `mongodbService.ts`: Database operations for all entities

## Security Considerations

1. **JWT Secret**: Always use a strong, random JWT secret in production
2. **Password Hashing**: Passwords are hashed using bcrypt with 12 salt rounds
3. **Token Management**: JWT tokens are stored in localStorage (consider using httpOnly cookies in production)
4. **Input Validation**: Implement proper input validation for all forms

## Production Deployment

1. **Environment Variables**: Set up proper environment variables for production
2. **MongoDB**: Use MongoDB Atlas or a managed MongoDB service
3. **JWT Secret**: Generate a secure random string for JWT_SECRET
4. **HTTPS**: Ensure all communications are over HTTPS
5. **CORS**: Configure CORS settings appropriately

## Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

### Project Structure

```
src/
├── components/          # React components
│   ├── Auth/           # Authentication components
│   ├── Common/         # Shared components
│   ├── Dashboard/      # Dashboard components
│   └── Layout/         # Layout components
├── config/             # Configuration files
├── pages/              # Page components
├── services/           # API services
├── store/              # Zustand store
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. 