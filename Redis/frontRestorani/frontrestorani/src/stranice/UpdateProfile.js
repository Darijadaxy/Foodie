import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../App';

function UpdateProfile({ isOpen, onClose }) {
  const { korisnik, setKorisnik } = useContext(AppContext);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    adress: ''
  });

  const [refresh, setRefresh] = useState(false); 

  useEffect(() => {
    if (korisnik) {
      setFormData({
        fullName: korisnik.ime || '',
        email: korisnik.email || '',
        phone: korisnik.telefon || '',
        adress: korisnik.adresa || '',
      });
    }
  }, [korisnik, isOpen]);

  useEffect(() => {
    if (refresh) {
      
      window.location.reload();
    }
  }, [refresh]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:5018/api/Korisnik/azurirajKorisnika', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('jwt')}`, 
        },
        body: JSON.stringify({
          Ime: formData.fullName,
          Email: formData.email,
          Telefon: formData.phone,
          Adresa: formData.adress,
        }),
      });
  
      if (!response.ok) {
        const errorMessage = await response.text();
        console.error('Error updating user:', errorMessage);
        alert(`Error: ${errorMessage}`);
      } else {
        const result = await response.text();
        console.log('User updated successfully:', result);
        
        setKorisnik(prevKorisnik => ({
          ...prevKorisnik,
          ime: formData.fullName,
          email: formData.email,
          telefon: formData.phone,
          adresa: formData.adress
        }));
        
        setRefresh(true);
      }
    } catch (error) {
      console.error('Error during update:', error);
      alert('An error occurred. Please try again later.');
    }
  
    onClose(); 
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '10px',
          padding: '20px',
          width: '400px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#000' }}>Update Profile</h2>
        <form>
          <div style={{ marginBottom: '15px' }}>
            <label
              htmlFor="fullName"
              style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 'bold',
                color: '#333',
              }}
            >
              Full Name:
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                color: '#000', 
                fontSize: '14px',
              }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 'bold',
                color: '#333',
              }}
            >
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                color: '#000', 
                fontSize: '14px',
              }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label
              htmlFor="phone"
              style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 'bold',
                color: '#333',
              }}
            >
              Phone:
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                color: '#000', 
                fontSize: '14px',
              }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label
              htmlFor="adress"
              style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 'bold',
                color: '#333',
              }}
            >
              Adress:
            </label>
            <input
              type="text"
              id="adress"
              name="adress"
              value={formData.adress}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                color: '#000', 
                fontSize: '14px',
              }}
            />
          </div>
          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={handleSave}
              style={{
                padding: '10px 20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginRight: '10px',
              }}
            >
              Save
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateProfile;