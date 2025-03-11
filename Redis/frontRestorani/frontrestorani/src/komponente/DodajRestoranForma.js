import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import myImage from '../assets/slika1.png';


export default function DodajRestoranForma(props) {
  const [naziv, setNaziv] = useState('');
  const [adresa, setAdresa] = useState('');
  const [telefon, setTelefon] = useState('');
  const [opis, setOpis] = useState('');
  const [slika, setSlika] = useState('');
  const [greska, setGreska] = useState(null);

  const navigate = useNavigate();

    const handleImageChange = () => {
        const el = document.getElementById("pfp")
        const img = el.files[0]
        const reader = new FileReader()
        reader.onloadend = () => {
            setSlika(reader.result)
        }
        reader.readAsDataURL(img)
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

    const restoran = {
      Naziv: naziv,
      Adresa: adresa,
      Telefon: telefon,
      Opis: opis,
      Slika: slika,
    };

    try {
      const token =  sessionStorage.getItem('jwt')
      const response = await fetch('http://localhost:5018/api/Restorani/dodajRestoran', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
           Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(restoran),
      });

      if (response.ok) {
        alert('The restaurant has been successfully added!');
        navigate('/restoraniSvi');
      } else {
        const errorMessage = await response.text();
        setGreska(errorMessage);
      }
    } catch (error) {
      setGreska('The error occured while adding the restaurant!');
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>New restaurant</h2>
        {greska && <p style={styles.error}>{greska}</p>}
        <div style={styles.inputGroup}>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={naziv}
            onChange={(e) => setNaziv(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label htmlFor="address">Address:</label>
          <input
            type="text"
            id="address"
            value={adresa}
            onChange={(e) => setAdresa(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label htmlFor="phone">Contact:</label>
          <input
            type="text"
            id="phone"
            value={telefon}
            onChange={(e) => setTelefon(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label htmlFor="description">Description:</label>
          <input
            type="text"
            id="description"
            value={opis}
            onChange={(e) => setOpis(e.target.value)}
            style={styles.input}
          />
        </div>
       
        <div className={`w-full flex-row relative ${slika !== '' && 'h-28'} align-middle`}>
                    <label htmlFor="pfp" className="block text-gray-700 font-bold mb-2 w-max">Add restaurant image</label>
                    {slika !== '' && (
                      <span className="w-20 absolute left-0">
                        <img src={slika} alt= "Add restaurant image" className="h-20 w-20 object-cover" />
                      </span>
                    )}
                    <input
                      id="pfp"
                      type="file"
                      accept=".jpg, .jpeg, .png"
                      onChange={handleImageChange}
                      required
                      className={`p-3 border  ${slika === '' ? 'w-full' : 'w-1/2 absolute left-24'}`}
                    />
        </div>

        <button 
            type="submit" style={styles.button}>
          Add restaurant
        </button>
      </form>
    </div>
  );
}

  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundImage:`url(${myImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    },
    form: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      padding: '40px',
      borderRadius: '12px',
      boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.2)',
      width: '500px',
      minHeight: '500px',
    },
    title: {
      textAlign: 'center',
      marginBottom: '30px',
      fontSize: '24px',
      fontWeight: 'bold',
    },
    inputGroup: {
      marginBottom: '20px',
    },
    input: {
      width: '100%',
      padding: '12px',
      borderRadius: '6px',
      border: '1px solid #ddd',
      fontSize: '16px',
    },
    button: {
      width: '100%',
      padding: '12px',
      marginTop: '20px',
      backgroundColor: '#4CAF50',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '16px',
    },
    error: {
      color: 'red',
      textAlign: 'center',
      fontSize: '14px',
    },

};

