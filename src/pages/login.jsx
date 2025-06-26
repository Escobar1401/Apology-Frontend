import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PrimaryButton from '../components/PrimaryButton';
import './login.css';

function Login() {
    const [correo, setCorreo] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ correo, contraseña }),
            });

            const data = await res.json();
            
            if (res.ok && data.status === 'success') {
                localStorage.setItem('token', data.token);
                localStorage.setItem('rol', data.rol);
                console.log('✅ Login exitoso', data);
                navigate('/home', { replace: true });
            } else {
                setError(data.mensaje || '‼️ Credenciales inválidas');
                console.error('Error de servidor:', data);
            }
        } catch (error) {
            console.error('🚨 Error de red', error);
            setError('Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form className="login-container-form" onSubmit={handleSubmit}>
                <div className="login-container-form-title">
                    <span>Iniciar Sesión</span>
                </div>

                {error && (
                    <div className="error-message">
                        <div className="error-message-text">{error}</div>
                    </div>
                )}

                <label className="login-form-input-label">Correo Institucional</label>
                <input
                    type="email"
                    placeholder="Correo institucional"
                    className="login-form-input-field"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    required
                />

                <label className="login-form-input-label">Contraseña</label>
                <input
                    type="password"
                    placeholder="********"
                    className="login-form-input-field"
                    value={contraseña}
                    onChange={(e) => setContraseña(e.target.value)}
                    
                />

                <div className="login-button-container">
                    <PrimaryButton text={loading ? 'Iniciando sesión...' : 'Iniciar Sesión'} type="submit" disabled={loading} />
                </div>

                <div className="login-container-form-forgot-password">
                    <Link to="/recoverypass">¿Olvidaste tu contraseña?</Link>
                </div>
            </form>
        </div>
    );
}

export default Login;
