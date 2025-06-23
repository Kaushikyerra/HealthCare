import { MongoClient, Db } from 'mongodb';

// MongoDB connection configuration
const MONGODB_URI = import.meta.env.VITE_MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = import.meta.env.VITE_MONGODB_DB_NAME || 'heal-together';

let client: MongoClient;
let db: Db;

export const connectToDatabase = async (): Promise<Db> => {
  if (db) {
    return db;
  }

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('MongoDB connected successfully');
    return db;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};

export const getDatabase = (): Db => {
  if (!db) {
    throw new Error('Database not connected. Call connectToDatabase() first.');
  }
  return db;
};

export const closeDatabase = async (): Promise<void> => {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
};

// Initialize database connection
connectToDatabase().catch(console.error); 