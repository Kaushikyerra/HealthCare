import React from 'react';

const Settings: React.FC = () => {
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Settings</h2>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Name</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
          placeholder="Enter your name"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Email</label>
        <input
          type="email"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
          placeholder="Enter your email"
        />
      </div>
      <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition">Save</button>
    </div>
  );
};

export default Settings; 