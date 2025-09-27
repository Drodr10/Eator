import { useState } from 'react'
import MapComponent from './MapComponent'
import AddPinForm from './AddPinForm'
import AuthModal from './AuthForm';
import './App.css'

function App() {
  const [showAddPinForm, setShowAddPinForm] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);

  const handleCloseForm = () => {
    setShowAddPinForm(false);
  };

  return (
    <div className="App">
      <MapComponent />
      <button 
        className="add-pin-button"
        onClick={() => setShowAddPinForm(true)}
      >
        +
      </button>
      <button 
        className="auth-button"
        onClick={() => setShowAuthForm(true)}
      >
        Login
      </button>
      {showAddPinForm && (
        <AddPinForm onClose={handleCloseForm} />
      )}
      {showAuthForm && <AuthModal onClose={() => setShowAuthForm(false)} />}

    </div>
  )
}

export default App
