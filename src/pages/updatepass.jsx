import React, { useState } from 'react';
import PrimaryButton from '../components/PrimaryButton';
import { useNavigate } from 'react-router-dom';
import './login.css';

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
function UpdatePass() {
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [currentPasswordError, setCurrentPasswordError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const passwordValidation = validatePassword(password);
        if (passwordValidation) {
            setError(passwordValidation);
            return;
        }

        setLoading(true);
        setError("");
        setPasswordError("");
        setSuccess("");

        const currentPasswordValidation = validatePassword(currentPassword);
        const confirmPasswordValidation = validatePassword(confirmPassword);

        setCurrentPasswordError(currentPasswordValidation);
        setConfirmPasswordError(confirmPasswordValidation);

        if (newPassword !== confirmPassword) {
            setError("Las contraseñas nuevas no coinciden.");
            return;
        }

        setLoading(true);
        try {
            // Suponiendo que usas JWT guardado en localStorage
            const token = localStorage.getItem('token');
            // Decodifica el JWT para obtener el id del usuario
            function parseJwt(token) {
                try {
                    return JSON.parse(atob(token.split('.')[1]));
                } catch (e) {
                    return null;
                }
            }
            const payload = parseJwt(token);
            const userId = payload ? payload.id : null;
            if (!userId) {
                setError("No se pudo identificar el usuario.");
                setLoading(false);
                return;
            }
            const response = await fetch(`http://localhost:3000/api/usuarios/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    contraseñaActual: currentPassword,
                    nuevaContraseña: newPassword
                })
            });
            const data = await response.json();
            if (response.ok) {
                setSuccess("Contraseña actualizada correctamente.");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                setError(data.message || "Error al actualizar la contraseña.");
            }
        } catch (err) {
            setError("Ocurrió un error en la conexión.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form className="login-container-form" onSubmit={handleSubmit}>
                <span className="login-container-form-title-profile">Actualizar Contraseña</span>

                {error && <div className="error-message error-message-text">{error}</div>}
                {success && <div className="success-message success-message-text">{success}</div>}

                <label className="login-form-input-label">Contraseña actual</label>
                <input
                    type="password"
                    placeholder="Contraseña actual"
                    className="login-form-input-field"
                    required
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    onBlur={() => setCurrentPasswordError(validatePassword(currentPassword))}
                    disabled={loading || !!success}
                    minLength="8"
                />
                {currentPasswordError && <div className="error-message error-message-text">{currentPasswordError}</div>}

                <label className="login-form-input-label">Nueva contraseña</label>
                <input
                    type="password"
                    placeholder="Nueva contraseña"
                    className="login-form-input-field"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    onBlur={() => setPasswordError(validatePassword(newPassword))}
                    disabled={loading || !!success}
                    minLength="8"
                />
                {passwordError && <div className="error-message error-message-text">{passwordError}</div>}

                <label className="login-form-input-label">Confirmar contraseña</label>
                <input
                    type="password"
                    placeholder="Confirmar contraseña"
                    className="login-form-input-field"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    onBlur={() => {
                        const error = validatePassword(confirmPassword);
                        setConfirmPasswordError(error || (newPassword !== confirmPassword ? 'Las contraseñas no coinciden' : ''));
                    }}
                    disabled={loading || !!success}
                    minLength="8"
                />
                {confirmPasswordError && <div className="error-message error-message-text">{confirmPasswordError}</div>}

                <div className="login-button-container">
                    <PrimaryButton type="submit" text={loading ? "Actualizando..." : "Actualizar contraseña"} disabled={loading} />
                </div>
            </form>
        </div>
    );
}

export default UpdatePass;
