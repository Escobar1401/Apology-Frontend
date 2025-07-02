import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PrimaryButton from '../components/PrimaryButton';
import './login.css';

function Login() {
    const [correo, setCorreo] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const navigate = useNavigate();

    const validateEmail = (email) => {
        const re = /^[^\s@]+@ieluiscarlosgalansarmiento\.edu\.co$/;
        if (!email) return 'El correo electrónico es requerido';
        if (!re.test(String(email).toLowerCase())) return 'Ingrese un correo electrónico válido @ieluiscarlosgalansarmiento.edu.co';
        return '';
    };

    const validatePassword = (password) => {
        if (!password) return 'La contraseña es requerida';
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate fields
        const emailValidation = validateEmail(correo);
        const passwordValidation = validatePassword(contraseña);
        
        setEmailError(emailValidation);
        setPasswordError(passwordValidation);
        setError('');
        
        if (emailValidation || passwordValidation) {
            return;
        }

        setLoading(true);

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
            setError('Error al conectar con el servidor. Por favor, intente de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setCorreo(value);
        if (emailError) {
            setEmailError(validateEmail(value));
        }
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setContraseña(value);
        if (passwordError) {
            setPasswordError(validatePassword(value));
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

                <div className="form-group">
                    <label className="login-form-input-label">Correo Institucional</label>
                    <input
                        type="email"
                        placeholder="Correo institucional"
                        className={`login-form-input-field ${emailError ? 'input-error' : ''}`}
                        value={correo}
                        onChange={handleEmailChange}
                        onBlur={() => setEmailError(validateEmail(correo))}
                        required
                    />
                    {emailError && (
                        <div className="error-message" style={{ fontSize: '0.8rem', marginTop: '5px' }}>
                            {emailError}
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label className="login-form-input-label">Contraseña</label>
                    <input
                        type="password"
                        placeholder="********"
                        className={`login-form-input-field ${passwordError ? 'input-error' : ''}`}
                        value={contraseña}
                        onChange={handlePasswordChange}
                        onBlur={() => setPasswordError(validatePassword(contraseña))}
                        required
                    />
                    {passwordError && (
                        <div className="error-message" style={{ fontSize: '0.8rem', marginTop: '5px' }}>
                            {passwordError}
                        </div>
                    )}
                </div>

                <div className="login-button-container">
                    <PrimaryButton 
                        text={loading ? 'Iniciando sesión...' : 'Iniciar Sesión'} 
                        type="submit" 
                        disabled={loading} 
                    />
                </div>

                <div className="login-container-form-forgot-password">
                    <Link to="/recoverypass">¿Olvidaste tu contraseña?</Link>
                </div>
            </form>
        </div>
    );
}

export default Login;
