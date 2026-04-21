import React, { Suspense, lazy, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';

const Login = lazy(() => import('./components/Auth/Login'));
const Register = lazy(() => import('./components/Auth/Register'));
const ChatInterface = lazy(() => import('./components/Chat/ChatInterface'));
const PortfolioDashboardPage = lazy(() => import('./pages/PortfolioDashboardPage'));
const PortfolioManagePage = lazy(() => import('./pages/PortfolioManagePage'));

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

const RouteFallback = () => (
  <div className="flex min-h-[100dvh] items-center justify-center px-4 text-sm text-slate-500 dark:text-slate-400">
    Loading...
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Navbar />
        <Suspense fallback={<RouteFallback />}>
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
        </Suspense>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      </Router>
    </ThemeProvider>
  );
}

export default App;
