import { useNavigate } from "react-router-dom"

import React from "react";

export default function Restoran(props) {
    console.log(props.restoran)

    const navigate = useNavigate();



    const selectRestoran = () => {
        sessionStorage.setItem('selectedRestoranId', props.restoran.idRestorana)
        navigate('../view_restaurant_food')
    }

    const {
        naziv,
        opis,
        adresa,
        telefon,
        slika,
        prosecnaOcena,
    } = props;

    return (
        
        <div
         onClick = {selectRestoran}  
         className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-6 hover:shadow-xl hover:scale-105 hover:bg-gray-100 transition-transform duration-300 ease-in-out"
         >
            <img 
                src={props.restoran.slika} 
                alt={props.naziv} 
                className="w-full h-48 object-cover rounded-md mb-4" 
            />
            <h2 className="text-2xl font-bold text-green-800 mb-2">{props.restoran.naziv}</h2>
            <p className="text-xl text-green-700 mb-4">{props.restoran.opis}</p>
            <p className="text-xl text-green-700">
                <strong>Address: </strong> {props.restoran.adresa}
            </p>
            <p className="text-xl text-green-700">
                <strong>Contact: </strong> {props.restoran.telefon}
            </p>
              
            {props.restoran.prosecnaOcena !== null && props.restoran.prosecnaOcena !== undefined ? (
            props.restoran.prosecnaOcena !== 0 ? (
                <p className="text-xl text-green-700">
                    <strong>Rating: </strong> {props.restoran.prosecnaOcena}
                </p>
            ) : (
                <p className="text-xl text-gray-500">
                    <strong>Rating: </strong> No ratings yet
                </p>
            )
            ) : null}

        </div>
    );
}
