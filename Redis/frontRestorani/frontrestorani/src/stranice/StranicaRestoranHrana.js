import {useContext, useEffect, useState} from "react";
import { AppContext } from "../App";
import { useNavigate } from "react-router-dom"
import ListaHrane from "../komponente/ListaHrane.js";
import UpdateRestoran from '../stranice/UpdateRestoran.js';


export default function StranicaRestoranHrana(){
    
        const [hrana, setHrana] = useState([])
        const [restoran, setRestoran] = useState(null)
        const [rating, setRating] = useState(0);
        const [error, setError] = useState("");
        const korisnik = useContext(AppContext).korisnik
        const [showRestaurantUpdate, setShowRestaurantUpdate] = useState(false);

        const navigate = useNavigate()

        const handleAddFoodClick = () => {
            navigate('/dodajHranu')
        };

        const loadHranaRestorana = async () => {
            const restoranID = sessionStorage.getItem('selectedRestoranId')
            
            try {
                
                    const response = await fetch(`http://localhost:5018/api/Restorani/preuzmiRestoran/${restoranID}`)
                    console.log(restoranID)
                    if(response.ok){
                        const data = await response.json()
                        setRestoran(data)
                        console.log("Response:", data);
                    }
                    else 
                    {
                        window.alert("Doslo je do greske s restoranom, response nije ok: "+ await response.text())
                    }
               
            }
            catch(error){
                window.alert("Doslo je do greske: " + error.message)
            }
           
            try {
              
                    const response = await fetch(`http://localhost:5018/api/Restorani/preuzmiHranuRestorana/${restoranID}`)
                    console.log(restoranID)
                    if(response.ok){
                        const data = await response.json()
                        setHrana(data)
                        console.log("Response:", data);

                    }
                    else 
                    {
                        window.alert("Doslo je do greske sa hranom, response nije ok: "+ await response.text())
                    }
              
            }
            catch(error){
                window.alert("Doslo je do greske: " + error.message)
            }
        }

        const handleRatingSubmit = async () => {
            if (rating < 1 || rating > 5) {
                setError("The rating must be between 1 and 5.");
                return;
            }

            setError("");
    
            const restoranID = sessionStorage.getItem('selectedRestoranId');
            const token = sessionStorage.getItem('jwt');
            try {
                const response = await fetch(`http://localhost:5018/api/Ocena/DodajOcenu/${restoranID}/${rating}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `bearer ${token}`
                    },
                  
                });
                if (response.ok) {
                    alert("Ocena uspešno poslata!");
                    setRating(0);
                    loadHranaRestorana();
                } else {
                    const errorMessage = await response.text();
                    alert(`Greška: ${errorMessage}`);
                }
            } catch (error) {
                alert("Došlo je do greške prilikom slanja ocene: " + error.message);
            }
        };

        const handleBrisanjeRestorana = async () => {
            const restoranID = sessionStorage.getItem('selectedRestoranId')
            const token = sessionStorage.getItem('jwt')
            try {
                const response = await fetch(`http://localhost:5018/api/Restorani/obrisiRestoran/${restoranID}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `bearer ${token}`
                      }
                })
                if (!response.ok) {
                    const errorMessage = await response.text();
                    console.error('Error deleting restaurant:', errorMessage);
                    alert(`Error: ${errorMessage}`);
                } else {
                    const result = await response.text();
                    alert('Restaurant deleted successfully')
                    console.log('Restaurant deleted successfully:', result);
                    navigate(-1) 

                }
            } catch (error) {
                console.error('Error during deletion:', error);
                alert('An error occurred. Please try again later.');
            }
          }
    
        useEffect(() => {
            loadHranaRestorana()
            
        }, [])

        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-green-100">
                {restoran ? (
                    <>
                       
                        <div className="relative w-full max-w-4xl p-10 bg-green-100 shadow-md rounded-lg">
                           
                            <div className="flex justify-end space-x-4 mb-4">
                                {korisnik != null && korisnik.jeAdmin && (
                                    <>
                                        <button
                                            className=" w-40 px-4 py-2 bg-green-700 text-white rounded-lg shadow hover:bg-green-800 transition"
                                            onClick={() => setShowRestaurantUpdate(true)}
                                        >
                                            Update
                                        </button>
                                        <button
                                            className=" w-40 px-4 py-2 bg-red-700 text-white rounded-lg shadow hover:bg-red-800 transition"
                                            onClick={handleBrisanjeRestorana}
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
        
                            
                            <div className="flex justify-end space-x-4 mb-4 ">
                                {korisnik && (
                                        <>
                                            <input
                                                type="number"
                                                value={rating}
                                                min="1"
                                                max="5"
                                                onChange={(e) => setRating(Number(e.target.value))}
                                                className="w-20 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700"
                                                placeholder="Rate 1-5"
                                            />
                                            <button
                                                className=" w-40 px-4 py-2 bg-green-700 text-white rounded-lg shadow hover:bg-green-800 transition"
                                                onClick={handleRatingSubmit}
                                            >
                                                Submit Rating
                                            </button>
                                        </>
                                )}
                            </div>
                            {error && <p className="text-red-500 text-sm mb-4 text-right">{error}</p>}
        
                            
                            <div className="text-center">
                                <h1 className="text-7xl font-bold text-green-700 mb-1">{restoran.naziv}</h1>
                                <h2 className="text-5xl font-bold text-green-700 mb-2">{restoran.adresa}</h2>
                            </div>
                            <div>
                                <p className="text-xl text-green-800 mb-1">
                                    {restoran.opis} | Contact: {restoran.telefon}
                                    {restoran.prosecnaOcena !== 0 && ` | Rating: ${restoran.prosecnaOcena}`}
                                </p>
                            </div>
        
                            
                            {korisnik != null && korisnik.jeAdmin && (
                                <div className="flex justify-center">
                                    <button
                                        className="w-40 bg-green-700 text-white px-4 py-2 rounded-lg shadow hover:bg-green-800 transition mt-4"
                                        onClick={handleAddFoodClick}
                                    >
                                        Add Food
                                    </button>
                                </div>
                            )}
                        </div>
        
                        
                        <div className="w-full max-w-4xl">
                            {hrana.length > 0 ? (
                                <ListaHrane lista={hrana}></ListaHrane>
                            ) : (
                                <p className="text-center text-gray-600 mt-8">
                                    The restaurant currently has no food available for ordering!
                                </p>
                            )}
                        </div>
        
                        <UpdateRestoran
                            isOpen={showRestaurantUpdate}
                            onClose={() => setShowRestaurantUpdate(false)}
                            restoran={restoran} 
                        />
                    </>
                ) : (
                    <p className="text-center text-gray-600">Loading restaurant data...</p>
                )}
            </div>
        );

}