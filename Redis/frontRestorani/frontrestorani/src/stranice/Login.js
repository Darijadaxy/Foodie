import React, { useState , useContext} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import myImage from '../assets/slika1.png';
import { AppContext } from '../App';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const setNaProfilu = useContext(AppContext).setNaProfilu
    const { tryLoad } = useContext(AppContext);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault(); 
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`http://localhost:5018/api/Korisnik/logujKorisnika/${email}/${password}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const token = await response.text();
                setSuccess('Uspešno ste se prijavili!');
                sessionStorage.setItem('jwt', token);
                setNaProfilu(true)
                await tryLoad();
                navigate('/glavna');
            } else {
                const errorMessage = await response.text();
                setError(errorMessage);
            }
        } catch (error) {
            setError('Došlo je do greške pri konekciji sa serverom.');
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleLogin} style={styles.form}>
                <h2 style={styles.title}>Login</h2>
                {error && <p style={styles.error}>{error}</p>}
                {success && <p style={styles.success}>{success}</p>}
                <div style={styles.inputGroup}>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>
                <button type="submit" style={styles.button}>
                    Log in
                </button>
                <p style={styles.registerText}>
                Don't have an account? <Link to="/register" style={styles.registerLink}>Register</Link>
                </p>
            </form>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundImage: `url(${myImage})`, 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
    },
    form: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)', 
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.2)',
        width: '400px',
        minHeight: '450px',
    },
    title: {
        textAlign: 'center',
        marginBottom: '30px',
        fontSize: '24px',
        fontWeight: 'bold',
    },
    inputGroup: {
        marginBottom: '20px',
    },
    input: {
        width: '100%',
        padding: '12px',
        borderRadius: '6px',
        border: '1px solid #ddd',
        fontSize: '16px'
    },
    button: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#4CAF50',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '16px'
    },
    error: {
        color: 'red',
        textAlign: 'center',
    },
    success: {
        color: 'green',
        textAlign: 'center',
        fontSize: '14px',
    },
    registerText: {
        textAlign: 'center',
        marginTop: '10px',
        fontSize: '14px',
    },
    registerLink: {
        color: '#4CAF50',
        textDecoration: 'none',
        fontWeight: 'bold',
    },
};

export default Login;