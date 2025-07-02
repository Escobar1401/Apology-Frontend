import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PrimaryButton from '../components/PrimaryButton';
import './login.css';

function RecoveryPass() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const navigate = useNavigate();

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@ieluiscarlosgalansarmiento\.edu\.co$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateEmail(email)) {
            setMessage({ text: 'Por favor ingresa un correo institucional válido (@ieluiscarlosgalansarmiento.edu.co)', type: 'error' });
            return;
        }

        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            // Verificar si el correo existe
            const checkEmailResponse = await fetch('http://localhost:3000/api/auth/check-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const emailData = await checkEmailResponse.json();

            if (!checkEmailResponse.ok) {
                throw new Error(emailData.mensaje || 'Error al verificar el correo');
            }

            // Solicitar token de recuperación
            const tokenResponse = await fetch('http://localhost:3000/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const tokenData = await tokenResponse.json();

            if (!tokenResponse.ok) {
                throw new Error(tokenData.mensaje || 'Error al generar el token de recuperación');
            }

            // Enviar correo con el enlace de recuperación
            const response = await fetch('http://localhost:3000/api/email/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: email,
                    subject: 'Recuperación de contraseña - Apology',
                    html: `
                    <h2>Recuperación de contraseña</h2>
                    <p>Hola,</p>
                    <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
                    <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
                    <p><a href="http://localhost:5173/changepass?token=${tokenData.token}">Restablecer contraseña</a></p>
                    <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
                    <p>El enlace expirará en 1 hora.</p>
                    <p>Saludos,<br/>Equipo de desarrollo de Apology</p>
                    `
                })
            });

            if (!response.ok) {
                throw new Error('Error al enviar el correo');
            }

            setMessage({
                text: 'Se ha enviado un enlace de recuperación a tu correo electrónico.',
                type: 'success'
            });
        } catch (error) {
            console.error('Error:', error);
            setMessage({
                text: error.message || 'Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form className="login-container-form" onSubmit={handleSubmit}>
                <div className="login-container-form-title">
                    <span>Recuperar contraseña</span>
                </div>

                {message.text && (
                    <div className={`alert ${message.type === 'error' ? 'error-message' : 'success-message'}`}>
                        {message.text}
                    </div>
                )}

                <label className="login-form-input-label">Correo Institucional</label>
                <input
                    type="email"
                    placeholder="Correo institucional"
                    className="login-form-input-field"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                />

                <div className="login-button-container">
                    <PrimaryButton type="submit" text={loading ? "Enviando..." : "Enviar enlace"} disabled={loading} />

                </div>

                <div className="login-container-form-forgot-password">
                    <Link to="/">Regresar</Link>
                </div>
            </form>
        </div>
    );
}

export default RecoveryPass;