
import React, { useState, useEffect } from 'react';
import Header from '../komponente/Header.js';
import RestoraniSvi from '../stranice/RestoraniSvi.js';

export default function Glavna() {
  const [restorani, setRestorani] = useState([]);
 
  const handleSearchResults = (results) => {
    setRestorani(results);
  };


  return (
    <div>
      <Header onSearch={handleSearchResults} />
      <RestoraniSvi restorani={restorani} />
    </div>
  );
}