import React, {useState, useEffect} from "react";
import ListaRestorana from "../komponente/ListaRestorana";

export default function Top10(){
    const [restorani, setRestorani] = useState([]);

  
    const loadTop10Restorani = async () => {
        try {
            const url = "http://localhost:5018/api/Restorani/Top10Restorana";

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setRestorani(data);
                console.log("Top 10 restorani:", data);
            } else {
                window.alert("Došlo je do greške: " + (await response.text()));
            }
        } catch (error) {
            window.alert("Došlo je do greške: " + error.message);
        }
    };

    useEffect(() => {
        loadTop10Restorani();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-green-100">
            <div className="text-center">
                <h1 className="text-7xl font-bold text-green-700 mt-16 mb-8">Top 10 Restaurants</h1>
            </div>
            <div className="w-full max-w-4xl">
                {restorani.length > 0 ? (
                    <ListaRestorana lista={restorani}></ListaRestorana>
                ) : (
                    <p className="text-center text-gray-600">No top restaurants available.</p>
                )}
            </div>
        </div>
    );

}