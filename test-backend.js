// Simple test script to verify backend and MongoDB Atlas connection
const testBackend = async () => {
  try {
    console.log('🔍 Testing backend server...');
    
    // Test if backend is running
    const response = await fetch('http://localhost:5000/api/test');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend server is running!');
      console.log('📊 MongoDB Atlas connection:', data.message);
      console.log('🗄️  Database:', data.database);
      console.log('⏰ Timestamp:', data.timestamp);
    } else {
      console.log('❌ Backend server responded with error:', response.status);
    }
  } catch (error) {
    console.log('❌ Backend server is not running or not accessible');
    console.log('Error:', error.message);
    console.log('\n💡 Make sure to:');
    console.log('1. Create a .env file in the server directory with your MongoDB Atlas connection string');
    console.log('2. Run "npm start" in the server directory');
  }
};

testBackend(); 