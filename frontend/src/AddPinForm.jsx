import { useState, useEffect } from 'react';
import axios from 'axios';

const AddPinForm = ({ onClose }) => {
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [error, setError] = useState(null);

  const getLocationButtonContent = () => {
    if (isGettingLocation) {
      return (
        <>
          <div className="spinner"></div>
          <span>Getting Location...</span>
        </>
      );
    }
    if (coordinates) {
      return (
        <span>✓ Location Found ({coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)})</span>
      );
    }
    return <span>Get My Location</span>;
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      setIsGettingLocation(true);
      setError(null);
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        console.log(`User is at: ${lat}, ${lng}`);
        setCoordinates({ lat, lng });
        setIsGettingLocation(false);
      }, (error) => {
        console.error("Error getting location:", error);
        setError("Could not get your location. Please enable location services.");
        setIsGettingLocation(false);
      });
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !locationName || !coordinates) {
      setError("Please fill in all fields and get your location.");
      return;
    }

    setError(null);
    setIsLoading(true);
    
    try {
      await axios.post("https://remedios-funest-amply.ngrok-free.dev/api/pins", {
        description,
        location_name: locationName,
        coordinates
      });
      
      alert("Pin added successfully!");
      // Reset form and close
      setDescription("");
      setLocationName("");
      setCoordinates(null);
      onClose();
    } catch (err) {
      console.error("Error adding pin:", err);
      setError("Failed to add pin. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="add-pin-overlay">
      <div className="overlay-backdrop" onClick={handleOverlayClick} aria-hidden="true"></div>
      <div className="add-pin-form">
        <div className="form-header">
          <h2>Add New Pin</h2>
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
          {error && <div className="error-message">{error}</div>}
        
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
        />
        
        <input
          type="text"
          placeholder="Location Name"
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          disabled={isLoading}
        />
        
        <button 
          type="button" 
          onClick={getLocation}
          disabled={isLoading || isGettingLocation}
          className="location-button"
        >
          {getLocationButtonContent()}
        </button>
        
        <button 
          type="submit" 
          disabled={isLoading || isGettingLocation}
          className="submit-button"
        >
          {isLoading ? (
            <>
              <div className="spinner"></div>
              Adding Pin...
            </>
          ) : (
            "Add Pin"
          )}
        </button>
        </form>
      </div>
    </div>
  );
};

export default AddPinForm;