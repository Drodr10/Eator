import { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import MapComponent from './MapComponent';
import AuthModal from './AuthModal';
import AddPinForm from './AddPinForm'; 
import Navbar from './Navbar';
import About from './About';
import './App.css';


function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAddPinModal, setShowAddPinModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('eator_token'));
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

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

  useEffect(() => {
    const token = localStorage.getItem('eator_token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('eator_token');
    setIsLoggedIn(false);
    navigate('/'); // Redirect to the home page after logout
  };

  const handleLoginSuccess = () => {
    const token = localStorage.getItem('eator_token');
    if (token) {
      setIsLoggedIn(true);
      navigate('/'); // Redirect to the home page after login
    }
  };


  return (
    <Router>
      <div className="App">
        <Navbar 
          isLoggedIn={isLoggedIn} 
          handleLogout={handleLogout} 
          setShowAuthModal={setShowAuthModal} 
        />
        <Routes>
          <Route path="/" element={<><MapComponent refreshKey={refreshKey} onPinUpdated={handlePinAdded} /><button className="add-pin-button" onClick={handleOpenAddPin}>Add a Pin</button></>} />
          <Route path="/about" element={<About />} />
        </Routes>

        {/* Modals */}
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} onLoginSuccess={handleLoginSuccess} />}
        {showAddPinModal && <AddPinForm onClose={() => setShowAddPinModal(false)} onPinAdded={handlePinAdded} />}
      </div>
    </Router>
  );
}

export default App;