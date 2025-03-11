import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, createContext } from 'react';
import Login from './stranice/Login.js';
import FormaProfil from './stranice/FormaProfil.js';
import Pocetna from './stranice/Pocetna.js';
import RestoraniSvi from './stranice/RestoraniSvi.js';
import StranicaRestoranHrana from './stranice/StranicaRestoranHrana.js';
import Glavna from './stranice/Glavna.js';
import DodajRestoranForma from './komponente/DodajRestoranForma.js';
import DodajHranuForma from './komponente/DodajHranuForma.js';
import Korpa from './stranice/Korpa.js';
import Top10 from './stranice/Top10.js';

const AppContext = createContext();

function App() {

  const [naProfilu, setNaProfilu] = useState(false);
  const [korisnik, setKorisnik] = useState(null);

  useEffect(() => {
    console.log('Current pathname:', window.location.pathname);
    setNaProfilu(window.location.pathname === '/glavna');
    tryLoad();
  }, []);

  const tryLoad = async () => {
    const token = sessionStorage.getItem('jwt');
    if (token !== null) {
      try {
        const response = await fetch('http://localhost:5018/api/Korisnik/PreuzmiKorisnika', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched user data:', data);
          setKorisnik(data);
          sessionStorage.setItem('mojiID', `${data.id}`);
        } else {
          sessionStorage.removeItem('jwt');
          console.error('Failed to fetch user:', await response.text());
        }
      } catch (error) {
        console.error('Error:', error.message);
      }
    }
  };


  return (
    <AppContext.Provider value={{ naProfilu: naProfilu, setNaProfilu: setNaProfilu, setKorisnik: setKorisnik, korisnik: korisnik, tryLoad }}>
    {console.log('AppContext values:', { naProfilu, korisnik })}  
      <Router>
        <Routes>
          <Route path="/" element={<Pocetna />} />
          <Route path="/register" element={<FormaProfil />} />
          <Route path="/login" element={<Login />} />
          <Route path="/restoraniSvi" element={<RestoraniSvi />} />
          <Route path="/view_restaurant_food" element={<StranicaRestoranHrana />} />
          <Route path="/glavna" element={<Glavna />} />
          <Route path="/dodajRestoran" element={<DodajRestoranForma />} />
          <Route path="/dodajHranu" element={<DodajHranuForma />} />
          <Route path="/top10" element={<Top10 />} />
          <Route path="/korpa" element={<Korpa />} />
        </Routes>
      </Router>
    </AppContext.Provider>
  );
}

export default App;
export { AppContext }