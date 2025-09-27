import { useState } from 'react'
import MapComponent from './MapComponent'
import AddPinForm from './AddPinForm'
import './App.css'

function App() {
  const [showAddPinForm, setShowAddPinForm] = useState(false);

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
      {showAddPinForm && (
        <AddPinForm onClose={handleCloseForm} />
      )}
    </div>
  )
}

export default App
