import React, { useEffect, useState } from 'react';
import { testMongoDBConnection } from '../services/apiService';

export const MongoDBTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const result = await testMongoDBConnection();
        setConnectionStatus('✅ MongoDB Atlas connection successful!');
        setData(result);
        setError(null);
      } catch (err: any) {
        setConnectionStatus('❌ MongoDB Atlas connection failed');
        setError(err.message);
        console.error('MongoDB connection error:', err);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md max-w-md mx-auto mt-8">
      <h3 className="text-lg font-semibold mb-2">MongoDB Atlas Connection Test</h3>
      <p className="mb-2">{connectionStatus}</p>
      
      {data && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
          <h4 className="font-medium text-green-800">Connection Details:</h4>
          <p className="text-sm text-green-700">Database: {data.database}</p>
          <p className="text-sm text-green-700">Message: {data.message}</p>
          <p className="text-sm text-green-700">Time: {new Date(data.timestamp).toLocaleString()}</p>
        </div>
      )}
      
      {error && (
        <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        <p>• Backend Server: http://localhost:5000</p>
        <p>• Frontend: http://localhost:5175</p>
        <p>• MongoDB Atlas: Connected via backend API</p>
      </div>
    </div>
  );
}; 