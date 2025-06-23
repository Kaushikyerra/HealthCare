import { ObjectId } from 'mongodb';
import { getDatabase } from '../config/mongodb';
import { User, Appointment, Prescription, CaretakerRequest, MedicationIntake } from '../types';

// Users
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const db = getDatabase();
    const usersCollection = db.collection('users');
    const users = await usersCollection.find({}, { projection: { password: 0 } }).toArray();
    return users as User[];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const db = getDatabase();
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ id: userId }, { projection: { password: 0 } });
    return user as User | null;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<User | null> => {
  try {
    const db = getDatabase();
    const usersCollection = db.collection('users');
    const result = await usersCollection.findOneAndUpdate(
      { id: userId },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after', projection: { password: 0 } }
    );
    return result as User | null;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Appointments
export const createAppointment = async (appointmentData: Omit<Appointment, 'id'>): Promise<Appointment> => {
  try {
    const db = getDatabase();
    const appointmentsCollection = db.collection('appointments');
    const appointment: Appointment = {
      ...appointmentData,
      id: new ObjectId().toString(),
    };
    await appointmentsCollection.insertOne(appointment);
    return appointment;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

export const updateAppointment = async (appointmentId: string, updates: Partial<Appointment>): Promise<Appointment | null> => {
  try {
    const db = getDatabase();
    const appointmentsCollection = db.collection('appointments');
    const result = await appointmentsCollection.findOneAndUpdate(
      { id: appointmentId },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return result as Appointment | null;
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw error;
  }
};

export const getAllAppointments = async (): Promise<Appointment[]> => {
  try {
    const db = getDatabase();
    const appointmentsCollection = db.collection('appointments');
    const appointments = await appointmentsCollection.find({}).sort({ date: -1 }).toArray();
    return appointments as Appointment[];
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
};

export const getUserAppointments = async (userId: string, userRole: string): Promise<Appointment[]> => {
  try {
    const db = getDatabase();
    const appointmentsCollection = db.collection('appointments');
    
    let filter: any = {};
    if (userRole === 'patient') {
      filter.patientId = userId;
    } else if (userRole === 'doctor') {
      filter.doctorId = userId;
    } else if (userRole === 'caretaker') {
      filter.caretakerId = userId;
    }
    
    const appointments = await appointmentsCollection.find(filter).sort({ date: -1 }).toArray();
    return appointments as Appointment[];
  } catch (error) {
    console.error('Error fetching user appointments:', error);
    throw error;
  }
};

// Prescriptions
export const addPrescription = async (appointmentId: string, prescription: Omit<Prescription, 'id'>): Promise<Prescription> => {
  try {
    const db = getDatabase();
    const appointmentsCollection = db.collection('appointments');
    const newPrescription: Prescription = {
      ...prescription,
      id: new ObjectId().toString(),
    };
    
    await appointmentsCollection.updateOne(
      { id: appointmentId },
      { $push: { prescriptions: newPrescription } }
    );
    
    return newPrescription;
  } catch (error) {
    console.error('Error adding prescription:', error);
    throw error;
  }
};

// Caretaker Requests
export const createCaretakerRequest = async (requestData: Omit<CaretakerRequest, 'id'>): Promise<CaretakerRequest> => {
  try {
    const db = getDatabase();
    const requestsCollection = db.collection('caretakerRequests');
    const request: CaretakerRequest = {
      ...requestData,
      id: new ObjectId().toString(),
    };
    await requestsCollection.insertOne(request);
    return request;
  } catch (error) {
    console.error('Error creating caretaker request:', error);
    throw error;
  }
};

export const updateCaretakerRequest = async (requestId: string, status: 'accepted' | 'rejected'): Promise<CaretakerRequest | null> => {
  try {
    const db = getDatabase();
    const requestsCollection = db.collection('caretakerRequests');
    const result = await requestsCollection.findOneAndUpdate(
      { id: requestId },
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return result as CaretakerRequest | null;
  } catch (error) {
    console.error('Error updating caretaker request:', error);
    throw error;
  }
};

export const getAllCaretakerRequests = async (): Promise<CaretakerRequest[]> => {
  try {
    const db = getDatabase();
    const requestsCollection = db.collection('caretakerRequests');
    const requests = await requestsCollection.find({}).sort({ requestDate: -1 }).toArray();
    return requests as CaretakerRequest[];
  } catch (error) {
    console.error('Error fetching caretaker requests:', error);
    throw error;
  }
};

export const getUserCaretakerRequests = async (userId: string, userRole: string): Promise<CaretakerRequest[]> => {
  try {
    const db = getDatabase();
    const requestsCollection = db.collection('caretakerRequests');
    
    let filter: any = {};
    if (userRole === 'patient') {
      filter.patientId = userId;
    } else if (userRole === 'caretaker') {
      filter.caretakerId = userId;
    }
    
    const requests = await requestsCollection.find(filter).sort({ requestDate: -1 }).toArray();
    return requests as CaretakerRequest[];
  } catch (error) {
    console.error('Error fetching user caretaker requests:', error);
    throw error;
  }
};

// Medication Intakes
export const recordMedicationIntake = async (intake: MedicationIntake): Promise<void> => {
  try {
    const db = getDatabase();
    const intakesCollection = db.collection('medicationIntakes');
    
    // Check if intake already exists
    const existingIntake = await intakesCollection.findOne({
      prescriptionId: intake.prescriptionId,
      date: intake.date,
      time: intake.time,
    });
    
    if (existingIntake) {
      // Update existing intake
      await intakesCollection.updateOne(
        { _id: existingIntake._id },
        { $set: { taken: intake.taken, updatedAt: new Date() } }
      );
    } else {
      // Create new intake
      await intakesCollection.insertOne({
        ...intake,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error('Error recording medication intake:', error);
    throw error;
  }
};

export const getMedicationIntakes = async (prescriptionId: string): Promise<MedicationIntake[]> => {
  try {
    const db = getDatabase();
    const intakesCollection = db.collection('medicationIntakes');
    const intakes = await intakesCollection.find({ prescriptionId }).sort({ date: -1, time: -1 }).toArray();
    return intakes as MedicationIntake[];
  } catch (error) {
    console.error('Error fetching medication intakes:', error);
    throw error;
  }
}; 