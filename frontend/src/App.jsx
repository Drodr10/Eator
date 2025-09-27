import React, { useState, useCallback } from 'react';
import MapComponent from './MapComponent';
import AuthModal from './AuthModal';
import AddPinForm from './AddPinForm'; // Import the new form
// ... other imports

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAddPinModal, setShowAddPinModal] = useState(false);
  
  // This state is used to trigger a refresh of the pins on the map
  const [refreshKey, setRefreshKey] = useState(0);

  const handleOpenAddPin = () => {
    const token = localStorage.getItem('eator_token');
    if (token) {
      setShowAddPinModal(true);
    } else {
      setShowAuthModal(true); // If not logged in, show login modal
    }
  };

  const handlePinAdded = useCallback(() => {
    // Increment the key to force MapComponent to re-fetch pins
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  return (
    <div className="App">
      {/* Pass the refreshKey to MapComponent */}
      <MapComponent refreshKey={refreshKey} />

      {/* Login/Signup Button */}
      <button className="auth-button" onClick={() => setShowAuthModal(true)}>
        Login / Sign Up
      </button>

      {/* Add Pin Pill Button */}
      <button className="add-pin-button" onClick={handleOpenAddPin}>
        Add a Pin
      </button>

      {/* Modals */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {showAddPinModal && <AddPinForm onClose={() => setShowAddPinModal(false)} onPinAdded={handlePinAdded} />}
    </div>
  );
}

export default App;