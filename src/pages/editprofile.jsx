import PrimaryButton from "../components/PrimaryButton";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

function EditProfile() {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState({});
    const [nuevoCorreo, setNuevoCorreo] = useState("");
    const [confirmarCorreo, setConfirmarCorreo] = useState("");
    const [nuevoTelefono, setNuevoTelefono] = useState("");
    const [confirmarTelefono, setConfirmarTelefono] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [colorMensaje, setColorMensaje] = useState('red');
    const [loading, setLoading] = useState(false);
    const [contraseñaActual, setContraseñaActual] = useState("");
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const userId = payload.id;
                fetch(`http://localhost:3000/api/usuarios/${userId}`)
                    .then(res => res.json())
                    .then(data => setUsuario(data))
                    .catch(err => console.error('Error al obtener usuario:', err));
            } catch (e) {
                console.error('Token inválido:', e);
            }
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Validación de correo solo si el usuario quiere modificarlo
        if (nuevoCorreo) {
            if (!/^[\w-.]+@ieluiscarlosgalansarmiento\.edu\.co$/.test(nuevoCorreo)) {
                setMensaje('El correo debe ser institucional (@ieluiscarlosgalansarmiento.edu.co)');
                setColorMensaje('red');
                setLoading(false);
                return;
            }
            if (nuevoCorreo.length < 3 || nuevoCorreo.length > 200) {
                setMensaje('El correo debe tener entre 3 y 200 caracteres.');
                setColorMensaje('red');
                setLoading(false);
                return;
            }
            if (nuevoCorreo !== confirmarCorreo) {
                setMensaje('Los correos no coinciden.');
                setColorMensaje('red');
                setLoading(false);
                return;
            }
        }
        // Validación de teléfono solo si el usuario quiere modificarlo
        if (nuevoTelefono) {
            if (!/^[0-9]{10}$/.test(nuevoTelefono)) {
                setMensaje('El teléfono debe tener exactamente 10 dígitos numéricos.');
                setColorMensaje('red');
                setLoading(false);
                return;
            }
            if (nuevoTelefono !== confirmarTelefono) {
                setMensaje('Los teléfonos no coinciden.');
                setColorMensaje('red');
                setLoading(false);
                return;
            }
        }
        const token = localStorage.getItem('token');
        if (!token) {
            setMensaje('No autenticado.');
            setLoading(false);
            return;
        }
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const userId = payload.id;
            // Solo enviar los campos que el usuario quiere modificar
            const datosPatch = {};
            if (nuevoCorreo && nuevoCorreo !== usuario.correo) datosPatch.correo = nuevoCorreo;
            if (nuevoTelefono && nuevoTelefono !== usuario.telefono) datosPatch.telefono = nuevoTelefono;

            if (Object.keys(datosPatch).length === 0) {
                setMensaje('No hay cambios para actualizar.');
                setLoading(false);
                return;
            }

            datosPatch.contraseñaActual = contraseñaActual;
            const response = await fetch(`http://localhost:3000/api/usuarios/${userId}/datos`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(datosPatch)
            });
            if (response.ok) {
                setMensaje('Datos actualizados exitosamente.');
                setColorMensaje('green');
                setTimeout(() => setMensaje(''), 3000);
                const data = await response.json();
                setUsuario(data);
                setNuevoCorreo("");
                setConfirmarCorreo("");
                setNuevoTelefono("");
                setConfirmarTelefono("");
            } else {
                const errorData = await response.json().catch(() => null);
                if (errorData && errorData.mensaje) {
                    setMensaje(errorData.mensaje);
                    setColorMensaje('red');
                } else {
                    setMensaje('Error al actualizar perfil.');
                    setColorMensaje('red');
                }
            }
        } catch (error) {
            setMensaje('Error de conexión con el servidor.');
        }
        setLoading(false);
    };


    return (
        <div className="login-container">
            <form className="login-container-form" onSubmit={handleSubmit}>
                <span className="login-container-form-title-profile">Editar Perfil</span>

                {mensaje && (
                    <div style={{ color: colorMensaje, marginBottom: '10px', fontWeight: 'bold' }}>{mensaje}</div>
                )}

                <label className="login-form-input-label">Tu correo institucional actual:</label>
                <input
                    type="email"
                    name="correo_actual"
                    placeholder={usuario.correo}
                    className="login-form-input-field"
                    readOnly
                />

                <label className="login-form-input-label">Correo Institucional Nuevo:</label>
                <input
                    type="email"
                    name="correo_nuevo"
                    placeholder="Correo institucional"
                    className="login-form-input-field"
                    value={nuevoCorreo}
                    onChange={e => setNuevoCorreo(e.target.value)}
                />

                <label className="login-form-input-label">Confirmar tu correo institucional nuevo:</label>
                <input
                    type="email"
                    name="correo_confirmar"
                    placeholder="Correo institucional"
                    className="login-form-input-field"
                    value={confirmarCorreo}
                    onChange={e => setConfirmarCorreo(e.target.value)}
                />

                <label className="login-form-input-label">Telefono Actual:</label>
                <input
                    type="tel"
                    name="telefono_actual"
                    placeholder={usuario.telefono}
                    className="login-form-input-field"
                    readOnly
                />

                <label className="login-form-input-label">Telefono Nuevo:</label>
                <input
                    type="tel"
                    name="telefono_nuevo"
                    placeholder="Telefono"
                    className="login-form-input-field"
                    value={nuevoTelefono}
                    onChange={e => setNuevoTelefono(e.target.value)}
                />

                <label className="login-form-input-label">Confirmar tu telefono nuevo:</label>
                <input
                    type="tel"
                    name="telefono_confirmar"
                    placeholder="Telefono"
                    className="login-form-input-field"
                    value={confirmarTelefono}
                    onChange={e => setConfirmarTelefono(e.target.value)}
                />

                <label className="login-form-input-label" style={{ marginTop: '10px' ,color: '#d4ac0d' }}>Ingrese su contraseña actual para confirmar los cambios</label>
                <input
                    type="password"
                    name="contraseña_actual"
                    placeholder="Contraseña"
                    className="login-form-input-field"
                    required
                    value={contraseñaActual}
                    onChange={e => setContraseñaActual(e.target.value)}
                />

                <div className="login-button-container">
                    <PrimaryButton
                        type="submit"
                        text={loading ? 'Guardando...' : 'Guardar'}
                        disabled={loading}
                    />
                </div>
            </form>
        </div>
    );
}

export default EditProfile;
