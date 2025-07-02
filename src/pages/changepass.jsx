import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PrimaryButton from '../components/PrimaryButton';
import './login.css';

function ChangePass() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [token, setToken] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [tokenValid, setTokenValid] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    const validatePassword = (password) => {
        const requirements = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            number: /\d/.test(password),
            special: /[@$!%*?&]/.test(password)
        };

        const missingRequirements = [];
        if (!requirements.length) missingRequirements.push('al menos 8 caracteres');
        if (!requirements.lowercase) missingRequirements.push('una letra minúscula');
        if (!requirements.uppercase) missingRequirements.push('una letra mayúscula');
        if (!requirements.number) missingRequirements.push('un número');
        if (!requirements.special) missingRequirements.push('un carácter especial (@$!%*?&)');

        if (missingRequirements.length > 0) {
            return 'La contraseña debe contener ' + missingRequirements.join(', ');
        }
        return '';
    };

    useEffect(() => {
        const urlToken = searchParams.get('token');
        
        if (!urlToken) {
            setError("No se proporcionó un token de recuperación.");
            setTokenValid(false);
            return;
        }

        const verifyToken = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/auth/validate-reset-token?token=${urlToken}`);
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.mensaje || 'Token inválido o expirado');
                }

                setToken(urlToken);
                setEmail(data.email || '');
                setTokenValid(true);
            } catch (error) {
                setError(error.message || "El enlace de recuperación no es válido o ha expirado.");
                setTokenValid(false);
            }
        };

        verifyToken();
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        const passwordValidation = validatePassword(password);
        if (passwordValidation) {
            setError(passwordValidation);
            return;
        }

        setLoading(true);
        setError("");
        setPasswordError("");
        setSuccess("");

        try {
            const response = await fetch('http://localhost:3000/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: token,  // El token de la URL
                    newPassword: password  // La nueva contraseña
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess("¡Contraseña actualizada exitosamente! Redirigiendo...");
                setPassword("");
                setConfirmPassword("");
                
                setTimeout(() => {
                    navigate('/');
                }, 3000);
            } else {
                setError(data.mensaje || "Error al actualizar la contraseña.");
            }
        } catch (error) {
            console.error('Error al actualizar la contraseña:', error);
            setError(error.message || "Ocurrió un error al actualizar la contraseña. Por favor, inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        
        if (confirmPassword && newPassword !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
        } else if (confirmPassword && newPassword === confirmPassword) {
            setError("");
        }
        
        const validationError = validatePassword(newPassword);
        setPasswordError(validationError);
    };

    const handleConfirmPasswordChange = (e) => {
        const newConfirmPassword = e.target.value;
        setConfirmPassword(newConfirmPassword);
        
        if (password !== newConfirmPassword) {
            setError("Las contraseñas no coinciden.");
        } else {
            setError("");
        }
    };

    if (!tokenValid) {
        return (
            <div className="login-container">
                <div className="login-container-form">
                    <div className="login-container-form-title">
                        <span>Error</span>
                    </div>
                    <div className="error-message">
                        {error || "El enlace de recuperación no es válido o ha expirado."}
                    </div>
                    <div className="login-container-form-forgot-password" style={{ marginTop: '20px' }}>
                        <a href="/recoverypass">Solicitar un nuevo enlace</a>
                    </div>
                    <div className="login-container-form-forgot-password">
                        <a href="/">Volver al inicio</a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <form className="login-container-form" onSubmit={handleSubmit}>
                <div className="login-container-form-title">
                    <span>Restablecer contraseña de: </span>
                    <span className="profile-info-value">{email}</span>
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <div className="form-group">
                    <label className="login-form-input-label">Nueva contraseña</label>
                    <input
                        type="password"
                        placeholder="Ingresa tu nueva contraseña"
                        className="login-form-input-field"
                        value={password}
                        onChange={handlePasswordChange}
                        onBlur={() => setPasswordError(validatePassword(password))}
                        disabled={loading || !!success}
                        required
                        minLength="8"
                    />
                    {passwordError && !error && (
                        <div className="error-message" style={{ fontSize: '0.8rem', marginTop: '5px' }}>
                            {passwordError}
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label className="login-form-input-label">Confirmar contraseña</label>
                    <input
                        type="password"
                        placeholder="Confirma tu nueva contraseña"
                        className="login-form-input-field"
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        onBlur={() => {
                            if (password !== confirmPassword) {
                                setError("Las contraseñas no coinciden.");
                            }
                        }}
                        disabled={loading || !!success}
                        required
                        minLength="8"
                    />
                </div>

                <div className="login-button-container">
                    <PrimaryButton type="submit" text={loading ? 'Actualizando...' : 'Actualizar contraseña'} disabled={loading || !!success} />
                </div>

                <div className="login-container-form-forgot-password">
                    <a href="/">Volver al inicio</a>
                </div>
            </form>
        </div>
    );
}

export default ChangePass;