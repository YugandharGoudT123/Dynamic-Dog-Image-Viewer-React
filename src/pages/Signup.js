import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../firebase';

// Since you requested Google-only sign in, Signup page will just offer Google sign-in
function Signup() {
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
      {error && <p className="error">{error}</p>}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
        <button onClick={handleGoogleSignIn} style={{ padding: '10px 16px', borderRadius: 8 }}>
          Continue with Google
        </button>
      </div>
    </div>
  );
}

export default Signup;
