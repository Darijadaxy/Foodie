import React, { useEffect, useState } from 'react';


const Korpa = () => {
  const [korpa, setKorpa] = useState(null);
  const [error, setError] = useState(null);
  const [numItems, setNumItems] = useState(0);

  useEffect(() => {
    const fetchKorpa = async () => {
      try {
        const token = sessionStorage.getItem('jwt');
        const response = await fetch("http://localhost:5018/api/StavkaUKorpi/preuzmiKorpuSaCenom", {
          method: 'GET',
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Greška pri preuzimanju podataka: ${response.statusText}`);
        } else {
          const data = await response.json();
          setKorpa(data); 
          const totalItems = data.stavke.reduce((acc, stavka) => acc + stavka.kolicina, 0);
          setNumItems(totalItems);
        }
      } catch (err) {
        setError("Došlo je do greške pri preuzimanju podataka o korpi.");
        console.error(err);
      }
    };

    fetchKorpa();
  }, []);

  const ukloniStavku = async (hranaId) => {
    try {
      const token = sessionStorage.getItem('jwt');
      const response = await fetch(`http://localhost:5018/api/StavkaUKorpi/izbaciStavkuIzKorpe/${hranaId}`, {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Greška pri brisanju stavke: ${response.statusText}`);
      }

      const updatedStavke = korpa.stavke.filter(stavka => stavka.hranaId !== hranaId);
      const updatedCena = updatedStavke.reduce((total, stavka) => total + stavka.ukupno, 0);
      setKorpa(prevKorpa => ({
        ...prevKorpa,
        stavke: updatedStavke,
        ukupnaCena: updatedCena,  
      }));
      setNumItems(updatedStavke.length);
    } catch (err) {
      setError("Došlo je do greške pri brisanju stavke.");
      console.error(err);
    }
  };

  const poruciHranu = async () => {
    try {
      const token = sessionStorage.getItem('jwt');
      const response = await fetch("http://localhost:5018/api/StavkaUKorpi/poruciHranu", {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Greška pri poručivanju hrane");
      }

      alert("Porudžbina je uspešno poslata!");
      setKorpa({ stavke: [], ukupnaCena: 0 });
      setNumItems(0);
    } catch (err) {
      setError("Došlo je do greške pri poručivanju hrane.");
      console.error(err);
    }
  };

  const izbrisiSveIzKorpe = async () => {
    try {
      const token = sessionStorage.getItem('jwt');
      const response = await fetch("http://localhost:5018/api/StavkaUKorpi/IzbrisiSveIzKorpe", {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Greška pri brisanju svih stavki");
      }

      setKorpa({ stavke: [], ukupnaCena: 0 });
      setNumItems(0);
    } catch (err) {
      setError("Došlo je do greške pri brisanju stavki.");
      console.error(err);
    }
  };

  return (
    <div>

    </div>
  );

 };

export default Korpa;



