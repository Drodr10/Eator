import { useState, useEffect } from 'react';
import axios from 'axios';

const EditPinForm = ({ pin, onClose, onPinUpdated }) => {
  const [formData, setFormData] = useState({ description: '', location_name: '', expiresAt: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Get the current time in the format required by the datetime-local input
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minDateTime = now.toISOString().slice(0, 16);
  
  // Pre-fill the form when the component loads
  useEffect(() => {
    if (pin) {
      // --- THIS IS THE FIX for pre-filling ---
      const date = new Date(pin.expiresAt);
      // Adjust for the browser's timezone before slicing
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
      const localExpiresAt = date.toISOString().slice(0, 16);
      // ------------------------------------
      
      setFormData({
        description: pin.description,
        location_name: pin.location_name,
        expiresAt: localExpiresAt
      });
    }
  }, [pin]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const now = new Date();
    const selectedExpiration = new Date(formData.expiresAt);
    const sixHoursLater = new Date(now.getTime() + 6 * 60 * 60 * 1000);

    if (selectedExpiration > sixHoursLater) {
      setError('Expiration time cannot exceed 6 hours from now.');
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem('eator_token');
    try {
        // --- THIS IS THE FIX for submitting ---
        // Creating a Date from the input string and converting to ISO
        // correctly handles the conversion from local time to UTC.
        const expiresAtISO = new Date(formData.expiresAt).toISOString();
        // ----------------------------------

        await axios.put(`https://eator.onrender.com/api/pins/${pin._id}`,
            { ...formData, expiresAt: expiresAtISO },
            { headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' } }
        );

        if (onPinUpdated) {
            onPinUpdated();
        }
        onClose();
    } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to update pin.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="add-pin-overlay">
      <div className="overlay-backdrop" onClick={onClose} />
      <div className="add-pin-form">
        <div className="form-header">
          <h2>Edit Pin</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <p className="error-message">{error}</p>}
          <input
            className="form-input"
            type="text"
            name="description"
            value={formData.description}
            onChange={(e) => {
              if (e.target.value.length <= 50) {
                handleInputChange(e);
              }
            }}
            required
          />
          <input
            className="form-input"
            type="text"
            name="location_name"
            value={formData.location_name}
            onChange={(e) => {
              if (e.target.value.length <= 50) {
                handleInputChange(e);
              }
            }}
            required
          />
          <input
            className="edit-datetime-input"
            type="datetime-local"
            name="expiresAt"
            value={formData.expiresAt}
            onChange={handleInputChange}
            min={minDateTime}
            required
          />
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? <div className="spinner" /> : 'Update Pin'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditPinForm;