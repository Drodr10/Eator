// In src/AddPinForm.jsx
import React, { useState } from 'react';
import axios from 'axios';

const AddPinForm = ({ onClose, onPinAdded }) => {
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [duration, setDuration] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLoading(false);
      },
      () => {
        setError('Unable to retrieve your location.');
        setIsLoading(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!coordinates) {
      setError('Please get your location first.');
      return;
    }
    setIsLoading(true);
    setError('');

    // Get the token from Local Storage
    const token = localStorage.getItem('eator_token');
    if (!token) {
      setError('You must be logged in to add a pin.');
      setIsLoading(false);
      return;
    }

    try {
      await axios.post('https://eator.onrender.com/api/pins', 
        {
          description,
          location_name: locationName,
          coordinates,
          duration_minutes: duration,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`, // Send the token
            'ngrok-skip-browser-warning': 'true' // Don't forget this!
          }
        }
      );
      onPinAdded(); // Tell the App component to refresh the pins
      onClose(); // Close the modal
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add pin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-pin-overlay">
      <div className="overlay-backdrop" onClick={onClose} aria-hidden="true"/>
      <div className="add-pin-form">
        <div className="form-header">
          <h2>Add a Pin</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <p className="error-message">{error}</p>}
          <input
            className="form-input"
            type="text"
            placeholder="Description (e.g., Pizza slices)"
            value={description}
            onChange={(e) => {
              if (e.target.value.length <= 50) {
                setDescription(e.target.value);
              }
            }}
            required
          />
          <input
            className="form-input"
            type="text"
            placeholder="Location (e.g., Marston Basement)"
            value={locationName}
            onChange={(e) => {
              if (e.target.value.length <= 50) {
                setLocationName(e.target.value);
              }
            }}
            required
          />
          <select
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="form-select"
            required
            >
            <option className="form-select" value={15}>15 minutes</option>
            <option className="form-select" value={30}>30 minutes</option>
            <option className="form-select" value={60}>1 hour</option>
            <option className="form-select" value={120}>2 hours</option>
            </select>
          <button type="button" onClick={handleGetLocation} className="location-button" disabled={isLoading}>
            {isLoading ? 'Getting...' : (coordinates ? 'Location Captured!' : 'Get Current Location')}
          </button>
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? <div className="spinner" /> : 'Add Pin'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPinForm;