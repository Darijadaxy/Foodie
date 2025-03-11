
import React, { useContext, useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UpdateProfile from '../stranice/UpdateProfile.js';
import { AppContext } from '../App.js';

export default function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [showProfileUpdate, setShowProfileUpdate] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const { setNaProfilu } = useContext(AppContext);
  const [isOpen, setIsOpen] = useState(false);

  const [error, setError] = useState(null);
  const [korpa, setKorpa] = useState(null);
  const [numItems, setNumItems] = useState(0);

  const navigate = useNavigate();
  ///
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
        }
        else{
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
      const response =await fetch(`http://localhost:5018/api/StavkaUKorpi/izbaciStavkuIzKorpe/${hranaId}`, {
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
      const totalItems = updatedStavke.reduce((acc, stavka) => acc + stavka.kolicina, 0);
      setNumItems(totalItems);
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


  const toggleKorpa = () => setIsOpen(!isOpen);

  if (error) {
    return <div className="text-red-600 text-center p-4">{error}</div>;
  }


  if (!korpa) {
    return <div className="text-center p-4 text-gray-500">Učitavanje korpe...</div>;
  }


  const stavke = korpa.stavke || [];

  ///

  const handleLogout = () => {
    fetch('http://localhost:5018/api/Korisnik/izlogujKorisnika', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem('jwt')}`
      },
      credentials: 'include',

    })
      .then((response) => {
        if (response.ok) {
          sessionStorage.removeItem('jwt');
          navigate('/');
          setNaProfilu(false);
        } else {
          console.error('Logout failed');
        }
      })
      .catch((error) => console.error('Error:', error));
  };
  const handleDelete = () => {
    fetch('http://localhost:5018/api/Korisnik/obrisiProfil', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem('jwt')}`
      },
      credentials: 'include',

    })
      .then((response) => {
        if (response.ok) {
          sessionStorage.removeItem('jwt');
          navigate('/');
          setNaProfilu(false);
            
        } else {
          console.error('Delete failed');
        }
      })
      .catch((error) => console.error('Error:', error));
  };


  return (
    <div>
      <header className="bg-green-700 text-white flex justify-between items-center px-4 py-2">
        <div className="text-xl font-bold">Foodie</div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleKorpa}
            className="text-white text-xl"
          >
            🛒
            {numItems > 0 && (
              <span className="bsolute top-0 right-0 bg-red-500 text-white rounded-full text-xs px-2">{numItems}</span>
            )}
          </button>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="text-white text-xl"
          >
            ⋮
          </button>

          {showDropdown && (
            <div className="bg-white rounded-lg shadow-lg z-30 absolute top-10 right-0 w-48">
              <button
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setShowLogoutConfirmation(true)}
              >
                Log Out
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setShowProfileUpdate(true)}
              >
                Update Profile
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setShowDeleteConfirmation(true)}
              >
                Delete Profile
              </button>
            </div>
          )}
        </div>

        {showLogoutConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <p className="text-center text-gray-800 mb-4">
                Are you sure you want to log out?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600"
                  onClick={handleLogout}
                >
                  Yes
                </button>
                <button
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                  onClick={() => setShowLogoutConfirmation(false)}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <p className="text-center text-gray-800 mb-4">
                Are you sure you want to delete your profile?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600"
                  onClick={handleDelete}
                >
                  Yes
                </button>
                <button
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                  onClick={() => setShowDeleteConfirmation(false)}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}
        
        <UpdateProfile
          isOpen={showProfileUpdate}
          onClose={() => setShowProfileUpdate(false)}
        />
      </header>

      <div
        className={`fixed top-0 right-0 w-105 bg-white shadow-lg h-full transform transition-transform ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{ transitionDuration: "0.3s" }}
      >
        <div className="p-6">
          <h2 className="text-3xl font-semibold text-center text-green-600 mb-6">Your Cart</h2>

           {/* X button for closing the cart */}
        <button
          className="absolute top-4 right-4 text-xl text-red-700"
          onClick={() => setIsOpen(false)}
        >
          ✖
        </button>

          {stavke.length === 0 ? (
            <p className="text-center text-gray-500">Your cart is empty</p>
          ) : (
            <div>
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-green-700 text-white">
                    <th className="px-4 py-2 text-left">Food</th>
                    <th className="px-4 py-2 text-left">Price</th>
                    <th className="px-4 py-2 text-left">Quantity</th>
                    <th className="px-4 py-2 text-left">Total</th>
                    <th className="px-4 py-2 text-left">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {stavke.map((stavka) => (
                    <tr key={stavka.hranaId} className="border-b hover:bg-green-50">
                      <td className="px-4 py-2">{stavka.naziv}</td>
                      <td className="px-4 py-2">{stavka.cena} EUR</td>
                      <td className="px-4 py-2">{stavka.kolicina}</td>
                      <td className="px-4 py-2">{stavka.ukupno} EUR</td>
                      <td className="px-4 py-2">
                        <button
                          className="text-red-600 hover:text-red-800"
                          onClick={() => ukloniStavku(stavka.hranaId)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 flex justify-between text-xl font-semibold text-green-700">
                <h3>Total Price:</h3>
                <span>{korpa.ukupnaCena} EUR</span>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={poruciHranu}
                  className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
                >
                  Order Food
                </button>
                <button
                  onClick={izbrisiSveIzKorpe}
                  className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );




















  // return (
  //   ///
   
  //   ////
  //     <header className="bg-green-700 text-white flex justify-between items-center px-4 py-2">
  //       <div className="text-xl font-bold">Foodie</div>

  //       <div className="flex items-center gap-4">
  //         <button
  //           onClick={() => navigate('/korpa')}
  //           className="text-white text-xl"
  //         >
  //           🛒
  //         {numItems > 0 && (
  //             <span className="bsolute top-0 right-0 bg-red-500 text-white rounded-full text-xs px-2">{numItems}</span>
  //         )}
  //         </button>
  //         <button
  //           onClick={() => setShowDropdown(!showDropdown)}
  //           className="text-white text-xl"
  //         >
  //           ⋮
  //         </button>

  //         {showDropdown && (
  //           <div className="bg-white rounded-lg shadow-lg z-30 absolute top-10 right-0 w-48">
  //             <button
  //               className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
  //               onClick={() => setShowLogoutConfirmation(true)}
  //             >
  //               Log Out
  //             </button>
  //             <button
  //               className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
  //               onClick={() => setShowProfileUpdate(true)}
  //             >
  //               Update Profile
  //             </button>
  //             <button
  //               className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
  //               onClick={() => setShowDeleteConfirmation(true)}
  //             >
  //               Delete Profile
  //             </button>
  //           </div>
  //         )}
  //       </div>
  //       {showLogoutConfirmation && (
  //         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
  //           <div className="bg-white rounded-lg shadow-lg p-6">
  //             <p className="text-center text-gray-800 mb-4">
  //               Are you sure you want to log out?
  //             </p>
  //             <div className="flex justify-center gap-4">
  //               <button
  //                 className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600"
  //                 onClick={handleLogout}
  //               >
  //                 Yes
  //               </button>
  //               <button
  //                 className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
  //                 onClick={() => setShowLogoutConfirmation(false)}
  //               >
  //                 No
  //               </button>
  //             </div>
  //           </div>
  //         </div>
  //       )}

  //       {showDeleteConfirmation && (
  //         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
  //           <div className="bg-white rounded-lg shadow-lg p-6">
  //             <p className="text-center text-gray-800 mb-4">
  //               Are you sure you want to delete your profile?
  //             </p>
  //             <div className="flex justify-center gap-4">
  //               <button
  //                 className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600"
  //                 onClick={handleDelete}
  //               >
  //                 Yes
  //               </button>
  //               <button
  //                 className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
  //                 onClick={() => setShowDeleteConfirmation(false)}
  //               >
  //                 No
  //               </button>
  //             </div>
  //           </div>
  //         </div>
  //       )}
  //       <UpdateProfile
  //         isOpen={showProfileUpdate}
  //         onClose={() => setShowProfileUpdate(false)}
  //       />
  //     </header>
  // );
}