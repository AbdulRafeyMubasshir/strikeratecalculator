import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';
import './Login.css';


function Login({ onLoginSuccess }) {
  const [storeId, setStoreId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .eq('password', password) // plaintext only for testing!
      .single();

    if (error || !data) {
      setErrorMsg('Invalid store ID or password');
    } else {
      onLoginSuccess(data);
    }
  };

  return (
    <div className="login-container">
      <h2>Store Login</h2>
      <form onSubmit={handleLogin} className="login-form">
        <label>Store ID:</label>
        <input
          type="text"
          value={storeId}
          onChange={(e) => setStoreId(e.target.value)}
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
      </form>

      {errorMsg && <p className="error-msg">{errorMsg}</p>}

      <button
        className="btn-secondary"
        onClick={() => navigate('/loginRM')}
        style={{ marginTop: '1rem' }}
      >
        Go to Manager Login
      </button>
    </div>
  );
}

export default Login;
