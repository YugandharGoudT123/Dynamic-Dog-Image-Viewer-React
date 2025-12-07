import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { logout } from '../firebase';

function Navbar() {
  const { user } = useContext(AuthContext);

  return (
    <nav className="nav">
      <Link to="/">Infinite Dogs</Link>
      <div className="spacer" />
      {user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link to="/files">📁 Files</Link>
          <Link to="/history">Login History</Link>
          <span>{user.email}</span>
          <button onClick={() => logout()}>Sign Out</button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
