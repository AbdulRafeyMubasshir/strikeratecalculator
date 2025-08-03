// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import KpiTracker from './KpiTracker';
import LoginRM from './LoginRM';
import ManagerDashboard from './ManagerDashboard';

function App() {
  const [loggedInStore, setLoggedInStore] = useState(null);
  const [loggedInManager, setLoggedInManager] = useState(null);

  // Store login handlers
  const handleLoginSuccess = (storeData) => {
    setLoggedInStore(storeData);
  };

  const handleLogout = () => {
    setLoggedInStore(null);
  };

  // Manager login handlers
  const handleManagerLoginSuccess = (managerData) => {
    setLoggedInManager(managerData);
  };

  const handleManagerLogout = () => {
    setLoggedInManager(null);
  };

  return (
    <Router>
      <Routes>
        {/* Store login and protected KPI Tracker */}
        <Route
          path="/login"
          element={
            loggedInStore ? <Navigate to="/" /> : <Login onLoginSuccess={handleLoginSuccess} />
          }
        />
        <Route
  path="/"
  element={
    <KpiTracker store={loggedInStore} onLogout={handleLogout} />
  }
/>


        {/* Manager login and protected dashboard */}
        <Route
          path="/loginRM"
          element={
            loggedInManager ? (
              <Navigate to="/managerDashboard" />
            ) : (
              <LoginRM onLogin={handleManagerLoginSuccess} />
            )
          }
        />
        <Route
          path="/managerDashboard"
          element={
            loggedInManager ? (
              <ManagerDashboard manager={loggedInManager} onLogout={handleManagerLogout} />
            ) : (
              <Navigate to="/loginRM" />
            )
          }
        />

        {/* Redirect unknown routes */}
        <Route
          path="*"
          element={<Navigate to={loggedInStore ? "/" : "/login"} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
