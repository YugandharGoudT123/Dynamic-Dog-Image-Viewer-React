import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import LoginHistory from './pages/LoginHistory';
import FileUpload from './pages/FileUpload';
import FileManager from './pages/FileManager';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/history" element={<ProtectedRoute><LoginHistory/></ProtectedRoute>} />
          <Route path="/files" element={<ProtectedRoute><FileManager/></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><FileUpload/></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
