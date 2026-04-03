import React from 'react';
import Navbar from '../components/Navbar';
import Login from '../components/Auth/Login';

const Auth = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="pt-32 md:pt-40">
        <Login />
      </div>
    </div>
  );
};

export default Auth;
