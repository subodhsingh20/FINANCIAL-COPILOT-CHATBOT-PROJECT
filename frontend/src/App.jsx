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
import PortfolioDashboardPage from './pages/PortfolioDashboardPage';
import PortfolioManagePage from './pages/PortfolioManagePage';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  return user ? children : <Navigate to="/login" />;
};

const RootRoute = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  return <Navigate to={user ? '/portfolio' : '/login'} />;
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
            path="/portfolio"
            element={
              <PrivateRoute>
                <PortfolioDashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/portfolio/manage"
            element={
              <PrivateRoute>
                <PortfolioManagePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <ChatInterface />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<RootRoute />} />
          <Route path="*" element={<RootRoute />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      </Router>
    </ThemeProvider>
  );
}

export default App;
