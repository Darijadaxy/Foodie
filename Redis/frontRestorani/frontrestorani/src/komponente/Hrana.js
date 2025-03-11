import { useNavigate } from "react-router-dom"
import {useContext, useState} from "react";
import React from "react";
import { AppContext } from "../App";
import UpdateHrana from '../stranice/UpdateHrana.js';


export default function Hrana(props) {
    console.log(props.hrana)
    const navigate = useNavigate();
    const korisnik = useContext(AppContext).korisnik
    const [showFoodUpdate, setShowFoodUpdate] = useState(false);


    const [quantity, setQuantity] = useState(1); 
    const handleQuantityChange = (event) => {
        const value = parseInt(event.target.value, 10);
        setQuantity(value > 0 ? value : 1); 
    };
    const handleAddToCart = async () => {
        const cartItem = {
            HranaId: props.hrana.idHrane, 
            Kolicina: quantity,      
        };

        try {
            const token= sessionStorage.getItem('jwt')
            const response = await fetch("http://localhost:5018/api/StavkaUKorpi/DodajStavkuUKorpu", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify(cartItem),
            });
    
            if (response.ok) {
                alert("Hrana je uspešno dodata u korpu!");
            } else {
     
                const error = await response.json();
                console.error("Greška na serveru:", error);
                alert(error.message || "Došlo je do greške.");
            }
        } catch (error) {
        
            console.error("Greška pri slanju zahteva:", error);
            alert("Došlo je do greške pri slanju zahteva.");
        }
       
    };

    const handleBrisanjeHrane = async () => {
        const token = sessionStorage.getItem('jwt')
        try {
            const response = await fetch(`http://localhost:5018/api/Hrana/obrisiHranu/${props.hrana.idHrane}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `bearer ${token}`
                  }
            })
            if (!response.ok) {
                const errorMessage = await response.text();
                console.error('Error deleting food:', errorMessage);
                alert(`Error: ${errorMessage}`);
            } else {
                const result = await response.text();
                alert('Food deleted successfully')
                console.log('Food deleted successfully:', result);
                
            }
        } catch (error) {
            console.error('Error during deletion:', error);
            alert('An error occurred. Please try again later.');
        }
      }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-6 relative">
           
            <div className="flex justify-end space-x-4 mb-4">
                {korisnik != null && korisnik.jeAdmin && (
                    <>
                        <button
                            className="px-4 py-2 bg-green-700 text-white rounded-lg shadow hover:bg-green-800 transition"
                            onClick={() => setShowFoodUpdate(true)}
                        >
                            Update
                        </button>
                        <button
                            className="px-4 py-2 bg-red-700 text-white rounded-lg shadow hover:bg-red-800 transition"
                            onClick={handleBrisanjeHrane} 
                        >
                            Delete
                        </button>
                    </>
                )}
            </div>
    
          
            <img 
                src={props.hrana.slika} 
                alt={props.hrana.naziv} 
                className="w-full h-48 object-cover rounded-md mb-4" 
            />
    
           
            <h2 className="text-2xl font-bold text-green-800 mb-2">{props.hrana.kategorija}</h2>
            <p className="text-xl text-green-700 mb-2">{props.hrana.naziv}</p>
            <p className="text-xl text-green-700">
                <strong>Ingredients:</strong> {props.hrana.opis}
            </p>
            <p className="text-xl text-green-700 mb-2">
                <strong>Price:</strong> {props.hrana.cena} EUR
            </p>
            <p className="text-xl text-green-700 mb-2">
                <strong>Quantity:</strong> {props.hrana.kolicina}
            </p>
    
     
            {korisnik != null && (
                <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
                   
                    <div className="flex items-center space-x-2">
                        <label htmlFor="quantity" className="text-green-700 font-semibold text-lg">
                            Quantity:
                        </label>
                        <input
                            id="quantity"
                            type="number"
                            min="1"
                            max={props.hrana.kolicina} 
                            value={quantity}
                            onChange={handleQuantityChange}
                            className="w-16 px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700"
                        />
                    </div>

                  
                    <button
                        className="px-4 py-2 bg-green-700 text-white rounded-lg shadow hover:bg-green-800 transition"
                        onClick={handleAddToCart}
                    >
                        Add to Cart
                    </button>
                </div>
    
            )}

    
            <UpdateHrana
                isOpen={showFoodUpdate}
                onClose={() => setShowFoodUpdate(false)}
                hrana={props.hrana} 
            />
        </div>
    );
    
    
}
