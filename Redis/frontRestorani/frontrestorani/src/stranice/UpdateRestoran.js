import { useState, useEffect, useContext } from 'react';

function UpdateRestoran({ isOpen, onClose, restoran }) {
    console.log(restoran)
    const [formData, setFormData] = useState({
        naziv: '',
        adresa: '',
        telefon: '',
        opis: '', 
        slika: ''
    });



    const [refresh, setRefresh] = useState(false); 
  
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            setFormData((prev) => ({ ...prev, slika: reader.result }));
          };
          reader.readAsDataURL(file);
        }
      };
      

    useEffect(() => {
        if (restoran) {
        setFormData({
            naziv: restoran.naziv || '',
            adresa: restoran.adresa || '',
            telefon: restoran.telefon || '',
            opis: restoran.opis || '',
            slika: restoran.slika || ''
        });
        }
    }, [restoran, isOpen]);

    useEffect(() => {
        if (refresh) {
        
        window.location.reload();
        }
    }, [refresh]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        const restoranID = sessionStorage.getItem('selectedRestoranId') 
        try {
        const response = await fetch(`http://localhost:5018/api/Restorani/azuriraj/${restoranID}`, {
            method: 'PUT',
            headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionStorage.getItem('jwt')}`, 
            },
            body: JSON.stringify({
            naziv: formData.naziv,
            adresa: formData.adresa,
            telefon: formData.telefon,
            opis: formData.opis,
            slika: formData.slika
            }),
        });
    
        if (!response.ok) {
            const errorMessage = await response.text();
            console.error('Error updating restaurant:', errorMessage);
            alert(`Error: ${errorMessage}`);
        } else {
            const result = await response.text();
            console.log('Restaurant updated successfully:', result);
            
           
            setRefresh(true);
        }
        } catch (error) {
        console.error('Error during update:', error);
        alert('An error occurred. Please try again later.');
        }
    
        onClose(); 
    };

    if (!isOpen) return null;

    return (
        <div
        style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}
        >
        <div
            style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '20px',
            width: '400px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            }}
        >
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#000' }}>Update Restaurant</h2>
            <form>
            <div style={{ marginBottom: '15px' }}>
                <label
                htmlFor="name"
                style={{
                    display: 'block',
                    marginBottom: '5px',
                    fontWeight: 'bold',
                    color: '#333',
                }}
                >
                Name:
                </label>
                <input
                type="text"
                id="naziv"
                name="naziv"
                value={formData.naziv}
                onChange={handleInputChange}
                style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #ccc',
                    color: '#000',
                    fontSize: '14px',
                }}
                />
            </div>
            <div style={{ marginBottom: '15px' }}>
                <label
                htmlFor="address"
                style={{
                    display: 'block',
                    marginBottom: '5px',
                    fontWeight: 'bold',
                    color: '#333',
                }}
                >
                Address:
                </label>
                <input
                type="text"
                id="adresa"
                name="adresa"
                value={formData.adresa}
                onChange={handleInputChange}
                style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #ccc',
                    color: '#000', 
                    fontSize: '14px',
                }}
                />
            </div>
            <div style={{ marginBottom: '15px' }}>
                <label
                htmlFor="contact"
                style={{
                    display: 'block',
                    marginBottom: '5px',
                    fontWeight: 'bold',
                    color: '#333',
                }}
                >
                Contact:
                </label>
                <input
                type="text"
                id="telefon"
                name="telefon"
                value={formData.telefon}
                onChange={handleInputChange}
                style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #ccc',
                    color: '#000', 
                    fontSize: '14px',
                }}
                />
            </div>
            <div style={{ marginBottom: '15px' }}>
                <label
                htmlFor="description"
                style={{
                    display: 'block',
                    marginBottom: '5px',
                    fontWeight: 'bold',
                    color: '#333',
                }}
                >
                Description:
                </label>
                <input
                type="text"
                id="opis"
                name="opis"
                value={formData.opis}
                onChange={handleInputChange}
                style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #ccc',
                    color: '#000', 
                    fontSize: '14px',
                }}
                />
            </div>
            <div style={{ marginBottom: '20px', position: 'relative' }}>
                <label
                    htmlFor="pfp"
                    style={{
                    display: 'block',
                    marginBottom: '5px',
                    fontWeight: 'bold',
                    color: '#333',
                    }}
                >
                    Image:
                </label>
                {formData.slika && (
                    <div style={{ position: 'absolute', top: '0', left: '0', width: '80px', height: '80px' }}>
                    <img
                        src={formData.slika}
                        alt="Image"
                        style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '5px',
                        }}
                    />
                    </div>
                )}
                <input
                    id="pfp"
                    type="file"
                    accept=".jpg, .jpeg, .png"
                    onChange={handleImageChange}
                    style={{
                    width: formData.slika ? 'calc(100% - 90px)' : '100%',
                    padding: '10px',
                    marginLeft: formData.slika ? '90px' : '0',
                    borderRadius: '5px',
                    border: '1px solid #ccc',
                    fontSize: '14px',
                    }}
                />
            </div>



            <div style={{ textAlign: 'center' }}>
                <button
                type="button"
                onClick={handleSave}
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginRight: '10px',
                }}
                >
                Save
                </button>
                <button
                type="button"
                onClick={onClose}
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }}
                >
                Cancel
                </button>
            </div>
            </form>
        </div>
        </div>
    );
}

export default UpdateRestoran;