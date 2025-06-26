import { Link } from 'react-router-dom';
import PrimaryButton from '../components/PrimaryButton';
import './login.css';

function recoverypass() {
    return (
        <div className="login-container">
            <form className="login-container-form">
                <div className="login-container-form-title">
                    <span>Recuperar contraseña</span>
                </div>

                <label className="login-form-input-label">Correo Institucional</label>
                <input
                    type="email"
                    placeholder="Correo institucional"
                    className="login-form-input-field"
                    required
                />

                <div className="login-button-container">
                    <PrimaryButton text="Enviar enlace" />
                </div>

                <div className="login-container-form-forgot-password">
                    <Link to="/">Regresar</Link>
                </div>
            </form>
        </div>
    );
}

export default recoverypass;