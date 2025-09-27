// In src/AddPinForm.jsx
import React, { useState } from 'react';
import axios from 'axios';

const AddPinForm = ({ onClose, onPinAdded }) => {
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [coordinates, setCoordinates] = useState(null);
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
      await axios.post('https://remedios-funest-amply.ngrok-free.dev/api/pins', 
        {
          description,
          location_name: locationName,
          coordinates,
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
            type="text"
            placeholder="Description (e.g., Pizza slices)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Location (e.g., Marston Basement)"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            required
          />
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