import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../firebase';

function Login() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleGoogleSignIn() {
    setError(null);
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
    }
  }

  return (
    <div className="auth">
      <h2>Sign in with Google</h2>
      {/* Short project description */}
      <p style={{ marginTop: 10, color: '#333' }}>
        This project implements the Lewis Instructional Software Architecture
        Phase 2 reference app — a React static site deployed to the cloud with
        Google authentication and planned NoSQL/file storage enhancements.
      </p>
      {error && <p className="error">{error}</p>}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
        <button onClick={handleGoogleSignIn} style={{ padding: '10px 16px', borderRadius: 8 }}>
          Continue with Google
        </button>
      </div>
    </div>
  );
}

export default Login;
