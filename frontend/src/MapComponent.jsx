import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';

const position = [29.6436, -82.3549];

const MapComponent = () => {
  const [pins, setPins] = useState([]);

  useEffect(() => {
    const getPins = async () => {
      try {
        // const res = await axios.get("http://localhost:5001/api/pins");
        const res = await axios.get("https://remedios-funest-amply.ngrok-free.dev/api/pins",
            { headers: { 'ngrok-skip-browser-warning': 'true' } }
        );
        setPins(res.data);
        console.log("Fetched pins:", res.data);
      } catch (err) {
        console.error("Error fetching pins:", err);
      }
    };

    getPins();
  }, []); // The empty array means this effect runs once when the component mounts

  return (
    <MapContainer center={position} minZoom={14} zoom={15} style={{ height: '100vh', width: '100%' }} maxBounds={[ [29.62, -82.38], [29.66, -82.33] ]}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Map over the pins and create a Marker for each one */}
      {Array.isArray(pins) && pins.map(pin => (
        <Marker key={pin._id} position={[pin.coordinates.lat, pin.coordinates.lng]}>
          <Popup>
            {pin.description} <br /> {pin.location_name}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;