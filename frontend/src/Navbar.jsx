import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './App.css'; // Assuming styles are in App.css

const Navbar = ({ isLoggedIn, handleLogout, setShowAuthModal }) => {
  return (
    <nav className="navbar">
      <h1>
        <Link to="/">Eator 🐊</Link>
      </h1>
      <ul className="navbar-links">
        <li>
          <Link to="/about">About</Link>
        </li>
      </ul>
      {isLoggedIn ? (
        <button className="auth-button logout" onClick={handleLogout}>
          Logout
        </button>
      ) : (
        <button className="auth-button login" onClick={() => setShowAuthModal(true)}>
          Login / Sign Up
        </button>
      )}
    </nav>
  );
};

Navbar.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  handleLogout: PropTypes.func.isRequired,
  setShowAuthModal: PropTypes.func.isRequired,
};

export default Navbar;