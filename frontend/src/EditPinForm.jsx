import { useState, useEffect } from 'react';
import axios from 'axios';

const EditPinForm = ({ pin, onClose, onPinUpdated }) => {
  const [formData, setFormData] = useState({ description: '', location_name: '', expiresAt: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Adjust for timezone
  const minDateTime = now.toISOString().slice(0, 16); // Format for datetime-local input
  
  // Pre-fill the form when the component loads
  useEffect(() => {
    if (pin) {
      // Format the date for the datetime-local input
      const localExpiresAt = new Date(pin.expiresAt).toISOString().slice(0, 16);
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

    const token = localStorage.getItem('eator_token');
    try {
      // Convert the local time back to a full ISO string for the backend
      const expiresAtISO = new Date(formData.expiresAt).toISOString();
      await axios.put(`https://remedios-funest-amply.ngrok-free.dev/api/pins/${pin._id}`,
        { ...formData, expiresAt: expiresAtISO },
        { headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' } }
      );
      onPinUpdated();
      onClose();
    } catch (err) {
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
            type="text"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="location_name"
            value={formData.location_name}
            onChange={handleInputChange}
            required
          />
          <input
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