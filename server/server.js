import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5002'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// MongoDB Connection
let db;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://harshakondamudi:cce23021@cluster0.gbsnn44.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const connectToMongoDB = async () => {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(process.env.DB_NAME || 'heal-together');
    console.log('✅ Connected to MongoDB Atlas successfully!');
    console.log('Database:', db.databaseName);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    // Exit the process if the database connection fails, as the app cannot run without it.
    process.exit(1);
  }
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'heal-together-super-secret-jwt-key-2024', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Test endpoint
app.get('/api/test', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    // Test database connection
    await db.admin().ping();
    res.json({ 
      message: '✅ MongoDB Atlas connection successful!',
      database: db.databaseName,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Database connection failed',
      details: error.message 
    });
  }
});

// User registration
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Received registration request:', req.body);  // Log incoming request
    
    const { 
      name, 
      email, 
      password, 
      role, 
      specialization, 
      experience, 
      languages, 
      bio, 
      gender,
      // Location fields
      address,
      city,
      state,
      zipCode,
      country,
      latitude,
      longitude,
      // Available slots for doctors
      availableSlots,
      // Medical Assistant specific fields
      medicalId,
      internshipCertificate,
      digiLockerVerified
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        details: {
          name: !!name,
          email: !!email,
          password: !!password,
          role: !!role
        }
      });
    }

    // Validate role
    const allowedRoles = ['patient', 'doctor', 'caretaker', 'medical-assistant'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user document
    const userDoc = {
      id: uuidv4(),
      name,
      email,
      role,
      specialization,
      experience,
      languages: Array.isArray(languages) ? languages : (languages ? languages.split(',').map(lang => lang.trim()) : []),
      bio,
      gender,
      verified: Math.random() > 0.3, // All roles start verified
      rating: role !== 'patient' ? 4 + Math.random() : undefined,
      available: role === 'caretaker' || role === 'medical-assistant' ? true : undefined,
      // Location information
      address,
      city,
      state,
      zipCode,
      country,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      // Available slots for doctors
      availableSlots: role === 'doctor' ? (availableSlots || []) : undefined,
      // Medical Assistant fields (optional)
      medicalId: role === 'medical-assistant' ? medicalId : undefined,
      internshipCertificate: role === 'medical-assistant' ? internshipCertificate : undefined,
      digiLockerVerified: role === 'medical-assistant' ? digiLockerVerified : undefined,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert user into database
    await db.collection('users').insertOne(userDoc);

    // Generate JWT token
    const token = jwt.sign(
      { userId: userDoc.id, email: userDoc.email, role: userDoc.role },
      process.env.JWT_SECRET || 'heal-together-super-secret-jwt-key-2024',
      { expiresIn: '7d' }
    );

    // Return user without password and token
    const { password: _, ...userWithoutPassword } = userDoc;
    res.status(201).json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Detailed Registration Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      error: 'Registration failed', 
      details: error.message 
    });
  }
});

// User login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'heal-together-super-secret-jwt-key-2024',
      { expiresIn: '7d' }
    );

    // Return user without password and token
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get all users
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const users = await db.collection('users').find({}, { projection: { password: 0 } }).toArray();
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.collection('users').findOne(
      { id: req.user.userId }, 
      { projection: { password: 0 } }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Appointments endpoints
app.post('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;
    
    // Check if the slot is available for the doctor
    const doctor = await db.collection('users').findOne({ id: doctorId });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    // Check if the doctor has available slots
    if (!doctor.availableSlots || doctor.availableSlots.length === 0) {
      return res.status(400).json({ error: 'Doctor has no available slots' });
    }
    
    // Get the day of the week for the appointment date
    const appointmentDate = new Date(date);
    const dayName = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    // Check if the doctor is available on this day
    const daySlots = doctor.availableSlots.find(slot => slot.day === dayName);
    if (!daySlots || !daySlots.slots.includes(time)) {
      return res.status(400).json({ error: 'Selected time slot is not available for this doctor' });
    }
    
    // Check if the slot is already booked
    const existingAppointment = await db.collection('appointments').findOne({
      doctorId,
      date,
      time,
      status: { $in: ['upcoming', 'ongoing'] }
    });
    
    if (existingAppointment) {
      return res.status(400).json({ error: 'This time slot is already booked' });
    }
    
    const appointmentData = {
      ...req.body,
      id: new ObjectId().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await db.collection('appointments').insertOne(appointmentData);
    res.status(201).json(appointmentData);
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

app.get('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const appointments = await db.collection('appointments').find({}).sort({ date: -1 }).toArray();
    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

app.put('/api/appointments/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updatedAt: new Date() };
    
    const result = await db.collection('appointments').findOneAndUpdate(
      { id },
      { $set: updates },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// Caretaker requests endpoints
app.post('/api/caretaker-requests', authenticateToken, async (req, res) => {
  try {
    const requestData = {
      ...req.body,
      id: new ObjectId().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await db.collection('caretakerRequests').insertOne(requestData);
    res.status(201).json(requestData);
  } catch (error) {
    console.error('Create caretaker request error:', error);
    res.status(500).json({ error: 'Failed to create caretaker request' });
  }
});

app.get('/api/caretaker-requests', authenticateToken, async (req, res) => {
  try {
    const requests = await db.collection('caretakerRequests').find({}).sort({ requestDate: -1 }).toArray();
    res.json(requests);
  } catch (error) {
    console.error('Get caretaker requests error:', error);
    res.status(500).json({ error: 'Failed to fetch caretaker requests' });
  }
});

app.put('/api/caretaker-requests/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const result = await db.collection('caretakerRequests').findOneAndUpdate(
      { id },
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Caretaker request not found' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Update caretaker request error:', error);
    res.status(500).json({ error: 'Failed to update caretaker request' });
  }
});

// Prescriptions endpoints
app.post('/api/appointments/:id/prescriptions', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const prescriptionData = {
      ...req.body,
      id: new ObjectId().toString(),
    };
    
    await db.collection('appointments').updateOne(
      { id },
      { $push: { prescriptions: prescriptionData } }
    );
    
    res.status(201).json(prescriptionData);
  } catch (error) {
    console.error('Add prescription error:', error);
    res.status(500).json({ error: 'Failed to add prescription' });
  }
});

// Medication intakes endpoints
app.post('/api/medication-intakes', authenticateToken, async (req, res) => {
  try {
    const intakeData = {
      ...req.body,
      id: new ObjectId().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Check if intake already exists
    const existingIntake = await db.collection('medicationIntakes').findOne({
      prescriptionId: intakeData.prescriptionId,
      date: intakeData.date,
      time: intakeData.time,
    });
    
    if (existingIntake) {
      // Update existing intake
      await db.collection('medicationIntakes').updateOne(
        { _id: existingIntake._id },
        { $set: { taken: intakeData.taken, updatedAt: new Date() } }
      );
    } else {
      // Create new intake
      await db.collection('medicationIntakes').insertOne(intakeData);
    }
    
    res.status(201).json(intakeData);
  } catch (error) {
    console.error('Record medication intake error:', error);
    res.status(500).json({ error: 'Failed to record medication intake' });
  }
});

app.get('/api/medication-intakes', authenticateToken, async (req, res) => {
  try {
    const { prescriptionId } = req.query;
    const filter = prescriptionId ? { prescriptionId } : {};
    
    const intakes = await db.collection('medicationIntakes').find(filter).sort({ date: -1, time: -1 }).toArray();
    res.json(intakes);
  } catch (error) {
    console.error('Get medication intakes error:', error);
    res.status(500).json({ error: 'Failed to fetch medication intakes' });
  }
});

// Update medical visit request status
app.patch('/api/medical-visits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await db.collection('medicalVisitRequests').updateOne(
      { id },
      { 
        $set: { 
          status,
          updatedAt: new Date().toISOString()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Medical visit request not found' });
    }

    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating medical visit request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Medical Visit Requests Endpoint
app.get('/api/medical-visit-requests', authenticateToken, async (req, res) => {
  try {
    const requests = await db.collection('medicalVisitRequests').find({}).toArray();
    res.json(requests);
  } catch (error) {
    console.error('Get medical visit requests error:', error);
    res.status(500).json({ error: 'Failed to fetch medical visit requests' });
  }
});

app.post('/api/medical-visit-requests', authenticateToken, async (req, res) => {
  try {
    const requestData = {
      ...req.body,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'pending'
    };
    
    await db.collection('medicalVisitRequests').insertOne(requestData);
    res.status(201).json(requestData);
  } catch (error) {
    console.error('Create medical visit request error:', error);
    res.status(500).json({ error: 'Failed to create medical visit request' });
  }
});

// User profile update route
app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updatedAt: new Date() };
    
    // Remove password from updates if present
    delete updates.password;
    
    const result = await db.collection('users').findOneAndUpdate(
      { id },
      { $set: updates },
      { returnDocument: 'after', projection: { password: 0 } }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectToMongoDB();

    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Call startServer to begin the application
startServer(); 