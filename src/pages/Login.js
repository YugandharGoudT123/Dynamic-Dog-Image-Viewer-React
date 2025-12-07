import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle, addLoginEvent } from '../firebase';

function Login() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleGoogleSignIn() {
    setError(null);
    try {
      const result = await signInWithGoogle();
      // record login event from client (Firestore rules must allow authenticated client writes)
      try {
        await addLoginEvent({
          uid: result.user?.uid,
          email: result.user?.email,
          displayName: result.user?.displayName,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        });
      } catch (e) {
        console.warn('Failed to record login event', e);
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
    }
  }

  return (
    <div className="auth">
      <h2>Sign in with Google</h2>
      {/* Short project description */}
      <div className="project-info-section">
        <p className="project-description">
          This project implements the Lewis Instructional Software Architecture
          Phase 3 reference app — a React static site deployed to the cloud with
          Google authentication and NoSQL/file storage.
        </p>
        <div className="team-members">
          <h4>Team Members:</h4>
          <ul className="team-list">
            <li>Sahithi Reddy Musuku</li>
            <li>Yugandhar Goud Thalla</li>
            <li>Abhishek Anand Makka</li>
          </ul>
        </div>
      </div>
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
