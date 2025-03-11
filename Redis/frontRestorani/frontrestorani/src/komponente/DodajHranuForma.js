import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import myImage from '../assets/slika1.png';


export default function DodajHranuForma(props) {
  const [naziv, setNaziv] = useState('');
  const [cena, setCena] = useState('');
  const [opis, setOpis] = useState('');
  const [slika, setSlika] = useState('');
  const [kategorija, setKategorija] = useState('');

  const [kolicina, setKolicina] = useState('');
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

    const hrana = {
      Naziv: naziv,
      Cena: cena,
      Opis: opis,
      Slika: slika,
      Kategorija: kategorija,
      Kolicina: kolicina, 
      RestoranId: sessionStorage.getItem('selectedRestoranId') 
    };

    try {
      const token =  sessionStorage.getItem('jwt')
      const response = await fetch('http://localhost:5018/api/Hrana/dodajHranu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
           Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(hrana),
      });

      if (response.ok) {
        alert('The food has been successfully added!');
        navigate('/view_restaurant_food');
      } else {
        const errorMessage = await response.text();
        setGreska(errorMessage);
      }
    } catch (error) {
      setGreska('The error occured while adding the food!');
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Food</h2>
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
          <label htmlFor="price">Price:</label>
          <input
            type="text"
            id="price"
            value={cena}
            onChange={(e) => setCena(e.target.value)}
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
        <div style={styles.inputGroup}>
          <label htmlFor="category">Category:</label>
          <input
            type="text"
            id="category"
            value={kategorija}
            onChange={(e) => setKategorija(e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label htmlFor="quantity">Quantity:</label>
          <input
            type="text"
            id="quantity"
            value={kolicina}
            onChange={(e) => setKolicina(e.target.value)}
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

        <button type="submit" style={styles.button}>
          Add food
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

