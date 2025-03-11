

import React from 'react';
import { Link } from 'react-router-dom';
import myImage from '../assets/slika1.png';
export default function Pocetna() {
  return (
    <div 
      className="pozadina-forma-profil bg-fixed bg-cover bg-center relative" 
      style={{ 
        backgroundImage: `url(${myImage})`,
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        height: '100vh',
        position: 'relative',
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
     
      <div 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0, 0, 0, 0.5)', 
          zIndex: 1 
        }}
      ></div>

     
      <div style={{ position: 'relative', zIndex: 2 }}>
        <h1 style={{ 
          fontSize: '16rem', 
          color: '#fff', 
        }}>
          Foodie
        </h1>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '20px', 
          marginTop: '20px',
        }}>
          <Link to="/restoraniSvi">
            <button className="w-[200px] py-6 bg-green-700 text-white text-xl font-semibold rounded-lg shadow-lg hover:bg-green-600 transition duration-300">
              Guest
            </button>
          </Link>
  
          <Link to="/login">
            <button className="w-[200px] py-6 bg-green-700 text-white text-xl font-semibold rounded-lg shadow-lg hover:bg-green-600 transition duration-300">
              Login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}