import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ChatInterface from './components/Chat/ChatInterface';
import Navbar from './components/Navbar';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <ChatInterface />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/chat" />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      </Router>
    </ThemeProvider>
  );
}

export default App;
