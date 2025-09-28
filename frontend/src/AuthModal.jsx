import React, { useState } from 'react';
import axios from 'axios';

// This component reuses the CSS from your AddPinForm
const AuthModal = ({ onClose, onLoginSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const url = isLoginMode 
      ? 'https://eator.onrender.com/api/login' 
      : 'https://eator.onrender.com/api/signup';

    try {
      const res = await axios.post(url, credentials);
      if (isLoginMode) {
        localStorage.setItem('eator_token', res.data.token);
        onLoginSuccess();
      } else {
        alert('Signup successful! Please log in.');
        setIsLoginMode(true); // Switch to login view after signup
      }
      onClose(); // Close the modal on success
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
        onClose();
    }
  };

  return (
    <div className="add-pin-overlay" >
      <div className="overlay-backdrop" onClick={handleOverlayClick} aria-hidden="true"/>
      <div className="add-pin-form">
        <div className="form-header">
          <h2>{isLoginMode ? 'Login' : 'Sign Up'}</h2>
          <button 
            type="button" 
            className="close-button"
            onClick={onClose}
            aria-label="Close form"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && <p className="error-message">{error}</p>}
          <input
            type="text"
            name="username"
            placeholder="Username"
            autoComplete="username"
            value={credentials.username}
            onChange={handleInputChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            autoComplete="current-password"
            value={credentials.password}
            onChange={handleInputChange}
            required
          />
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? <div className="spinner" /> : (isLoginMode ? 'Login' : 'Sign Up')}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', paddingBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={() => setIsLoginMode(!isLoginMode)}
            style={{ color: '#007bff', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {isLoginMode ? 'Need an account? Sign Up' : 'Have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;