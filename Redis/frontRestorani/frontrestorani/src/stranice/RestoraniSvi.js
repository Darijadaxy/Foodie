
import React, {useContext, useState, useEffect} from "react";
import { AppContext } from "../App";
import ListaRestorana from "../komponente/ListaRestorana";

export default function RestoraniSvi(){
    const [restorani, setRestorani] = useState([])
    const [searchTerm, setSearchTerm] = useState(""); 
    const [filteredRestorani, setFilteredRestorani] = useState([]); 
    const korisnik = useContext(AppContext).korisnik

    
    const loadRestorani = async (query = "") => {
        try {
            const url = query
                ? `http://localhost:5018/api/Restorani/pretraziRestoranePoNazivu?naziv=${query}`
                : "http://localhost:5018/api/Restorani/preuzmiSveRestorane";

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setRestorani(data);
                setFilteredRestorani(data);
                console.log("Response:", data);
            } else {
                window.alert("Došlo je do greške: " + (await response.text()));
            }
        } catch (error) {
            window.alert("Došlo je do greške: " + error.message);
        }
    };

    useEffect(() => {
        loadRestorani()
    }, [])

    
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    
    const handleSearch = () => {
        loadRestorani(searchTerm);
    };


    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-green-100">
            
             <div className="w-full max-w-4xl mt-4 mb-4 flex items-center">
             <input
                type="text"
                placeholder="Search restaurants..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
             />
             <button
                onClick={handleSearch}
                className="px-6 py-2 bg-green-700 text-white rounded-r-lg shadow-md hover:bg-green-800 transition-colors"
             >
             Search
             </button>
        </div>

        
        <div className="w-full max-w-4xl mb-12 flex items-center justify-between">
            <p className="text-green-800 text-xl">
                Discover the best and most highly rated restaurants, recommended by our users...
            </p>
           
            <a
                href="/top10"
                className="text-green-700 underline hover:text-green-900 text-3xl font-medium"
            >
                View top 10
            </a>
        </div>

        {korisnik != null && korisnik.jeAdmin && (
            <div className="w-full max-w-4xl mb-12 flex items-center justify-between">
                <p className="text-green-800 text-xl">
                    Add restaurant...
                </p>
                <a
                    href="/dodajRestoran" 
                    className="text-green-700 underline hover:text-green-900 text-3xl font-medium"
                >
                    Add restaurant
                </a>
            </div>
        )}


        <div className="text-center">
            <h1 className="text-7xl font-bold text-green-700 mt-10 mb-8">Explore Restaurants</h1>
        </div>
        <div className="w-full max-w-4xl">
            {restorani.length > 0 ? (
                 <ListaRestorana lista={restorani}></ListaRestorana>
            ) : (
               <p className="text-center text-gray-600">No restaurants available.</p>
            )}
        </div>
        </div>
    );
    
}