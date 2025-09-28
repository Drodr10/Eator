import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Countdown from './Countdown.jsx';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

import EditPinForm from './EditPinForm.jsx';

const position = [29.6436, -82.3549];

const MapComponent = ({ refreshKey, onPinUpdated }) => {
  const [pins, setPins] = useState([]);
  const [user, setUser] = useState(null);
  const [editingPin, setEditingPin] = useState(null);

  const getUserFromToken = () => {
    const token = localStorage.getItem('eator_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (err) {
        console.error("Invalid token:", err);
        localStorage.removeItem('eator_token');
        setUser(null);
      }
    }
  };

  useEffect(() => {
    getUserFromToken();

    const getPins = async () => {
      try {
        const res = await axios.get("https://eator.onrender.com/api/pins",
            { headers: { 'ngrok-skip-browser-warning': 'true' } }
        );
        setPins(res.data);
        console.log("Fetched pins:", res.data);
      } catch (err) {
        console.error("Error fetching pins:", err);
      }
    };

    getPins();
  }, [refreshKey]); // The empty array means this effect runs once when the component mounts

  const handleDelete = async (pinId) => {
    if (!window.confirm("Are you sure you want to delete this pin?")) return;
    
    try {
        const token = localStorage.getItem('eator_token');
        await axios.delete(`https://eator.onrender.com/api/pins/${pinId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true'
            }
        });
        setPins(pins.filter(pin => pin._id !== pinId));
    } catch (err) {
        console.error("Error deleting pin:", err);
        alert("Failed to delete pin. Please try again.");
    }
  };

  return (
    <>
    <MapContainer center={position} minZoom={14} zoom={15} style={{ height: '100vh', width: '100%' }} maxBounds={[ [29.62, -82.38], [29.66, -82.33] ]}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Map over the pins and create a Marker for each one */}
      {Array.isArray(pins) && pins.map(pin => {
        const canModify = user && (user.role === 'Admin' || user.user_id === pin.user_id);
        return (
          <Marker key={pin._id} position={[pin.coordinates.lat, pin.coordinates.lng]}>
            <Popup>
               <p className="popup"><strong>{pin.description}</strong></p>
                <p className="popup">Location: {pin.location_name}</p>
                <p className="popup"><small>Posted by: {pin.username}</small></p>
                {console.log("Pin expires at:", pin.expiresAt)}
                <Countdown expiresAt={String(pin.expiresAt)} />

                {canModify && (
                  <div className="popup-buttons">
                    <button className="edit-button" onClick={() => setEditingPin(pin)}>Edit</button>
                    <button className="delete-button" onClick={() => handleDelete(pin._id)}>Delete</button>
                  </div>
                )}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>

    {editingPin && (
      <EditPinForm 
        pin={editingPin}
        onClose={() => setEditingPin(null)}
        onPinUpdated={() => {
            if (onPinUpdated) onPinUpdated();
            setEditingPin(null);
        }}
      />
    )}
  </>
  );
};

export default MapComponent;