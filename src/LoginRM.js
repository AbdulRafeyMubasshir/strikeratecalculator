import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';
import './LoginRM.css';


function LoginRM({ onLogin }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const { data, error } = await supabase
      .from('managers')
      .select('*')
      .eq('name', name)
      .single();

    if (error || !data) {
      setError('Manager not found');
      return;
    }

    // Demo: Plaintext password check (replace with proper hashing in prod)
    if (data.password_hash !== password) {
      setError('Incorrect password');
      return;
    }

    onLogin(data);
  };

  return (
    <div className="loginrm-container">
      <h1>Manager Login</h1>
      <form onSubmit={handleSubmit} className="loginrm-form">
        <label>Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />

        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="btn-primary">
          Login
        </button>

        {error && <p className="error-msg">{error}</p>}
      </form>

      <button
        className="btn-secondary"
        onClick={() => navigate('/login')}
        style={{ marginTop: '1.5rem' }}
      >
        Go to Store Login
      </button>
    </div>
  );
}

export default LoginRM;
