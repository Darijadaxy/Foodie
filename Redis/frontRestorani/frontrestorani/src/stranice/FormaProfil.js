import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import myImage from '../assets/slika1.png';

export default function FormaProfil(props) {
  const [ime, setIme] = useState('');
  const [email, setEmail] = useState('');
  const [sifra, setSifra] = useState('');
  const [telefon, setTelefon] = useState('');
  const [adresa, setAdresa] = useState('');
  const [greska, setGreska] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const korisnik = {
      Ime: ime,
      Email: email,
      Sifra: sifra,
      Telefon: telefon,
      Adresa: adresa,
    };

    try {
      const response = await fetch('http://localhost:5018/api/Korisnik/registrujKorisnika', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(korisnik),
      });

      if (response.ok) {
        alert('Korisnik uspešno registrovan!');
        navigate('/login');
      } else {
        const errorMessage = await response.text();
        setGreska(errorMessage);
      }
    } catch (error) {
      setGreska('Došlo je do greške prilikom registracije.');
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Register</h2>
        {greska && <p style={styles.error}>{greska}</p>}
        <div style={styles.inputGroup}>
          <label htmlFor="ime">Name:</label>
          <input
            type="text"
            id="ime"
            value={ime}
            onChange={(e) => setIme(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label htmlFor="sifra">Password:</label>
          <input
            type="password"
            id="sifra"
            value={sifra}
            onChange={(e) => setSifra(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label htmlFor="telefon">Phone:</label>
          <input
            type="text"
            id="telefon"
            value={telefon}
            onChange={(e) => setTelefon(e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label htmlFor="adresa">Address:</label>
          <input
            type="text"
            id="adresa"
            value={adresa}
            onChange={(e) => setAdresa(e.target.value)}
            style={styles.input}
          />
        </div>
        <button type="submit" style={styles.button}>
        Register
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
    width: '400px',
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
