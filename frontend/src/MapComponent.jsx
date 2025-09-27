import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';

// UF's Lat/Lng
const position = [29.6436, -82.3549];

const MapComponent = () => {
  const [pins, setPins] = useState([]);

  useEffect(() => {
    // Fetch pins from your teammate's backend API
    const getPins = async () => {
      try {
        // Make sure the URL matches where your teammate's server is running
        const res = await axios.get("http://localhost:5001/api/pins");
        setPins(res.data);
        console.log("Fetched pins:", res.data);
      } catch (err) {
        console.error("Error fetching pins:", err);
      }
    };

    getPins();
  }, []); // The empty array means this effect runs once when the component mounts

  return (
    <MapContainer center={position} zoom={15} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Map over the pins and create a Marker for each one */}
      {pins.map(pin => (
        <Marker key={pin._id} position={pin.coordinates}>
          <Popup>
            {pin.description} <br /> {pin.location_name}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;