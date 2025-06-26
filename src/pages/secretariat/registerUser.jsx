import { useState, useEffect } from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import PrimaryButton from '../../components/PrimaryButton';
import '../login.css';

function RegisterUsuario() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        documento: '',
        nombres: '',
        apellidos: '',
        telefono: '',
        correo: '',
        contraseña: '',
        rol: 'Estudiante' // Establecer 'Estudiante' como valor por defecto
    });

    useEffect(() => {
        const fetchGrupos = async () => {
            if (form.rol === 'Estudiante') {
                setLoadingGrupos(true);
                try {
                    const response = await fetch('http://localhost:3000/api/grupos');
                    if (response.ok) {
                        const data = await response.json();
                        setGrupos(data);
                    } else {
                        console.error('Error al cargar los grupos');
                    }
                } catch (error) {
                    console.error('Error de conexión:', error);
                } finally {
                    setLoadingGrupos(false);
                }
            } else {
                setGrupos([]);
                setSelectedGrupo('');
            }
        };
        fetchGrupos();
    }, [form.rol]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log('Cambiando campo:', name, 'a:', value);
        setForm(prevForm => {
            const newForm = { ...prevForm, [name]: value };
            console.log('Nuevo estado del formulario:', newForm);
            return newForm;
        });
    };

    const handleGrupoChange = (e) => {
        setSelectedGrupo(e.target.value);
    }; 

    const [loading, setLoading] = useState(false);
    const [grupos, setGrupos] = useState([]);
    const [selectedGrupo, setSelectedGrupo] = useState('');
    const [loadingGrupos, setLoadingGrupos] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const camposObligatorios = ['documento', 'nombres', 'apellidos', 'telefono', 'correo', 'contraseña'];
        const camposVacios = camposObligatorios.some(campo => !form[campo]?.trim());

        if (camposVacios) {
            console.log('Formulario:', form);
            alert('‼️ Todos los campos son obligatorios');
            return;
        }

        setLoading(true);

        const maxAttempts = 3;
        let attempts = 0;

        while (attempts < maxAttempts) {
            try {
                // Primero creamos el usuario
                const userDataToSend = {
                    ...form,
                    rol: form.rol || 'Estudiante' // Asegurarse de que el rol esté incluido
                };

                const userResponse = await fetch('http://localhost:3000/api/usuarios', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(userDataToSend)
                });

                if (!userResponse.ok) {
                    const error = await userResponse.json().catch(() => ({ mensaje: 'Error desconocido' }));
                    const mensaje = error.mensaje || 'Error en el registro';

                    if (mensaje.includes('documento ya existe')) {
                        alert('‼️ ' + mensaje);
                    } else if (mensaje.includes('obligatorios')) {
                        alert('‼️ ' + mensaje);
                    } else {
                        alert('‼️ Error: ' + mensaje);
                    }
                    return;
                }

                const userData = await userResponse.json();
                
                // Si es estudiante, lo asignamos al grupo seleccionado
                if (form.rol === 'Estudiante' && selectedGrupo) {
                    const grupoResponse = await fetch('http://localhost:3000/api/grupos/estudiantes-grupo', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                            estudiante_id: userData.id,
                            grupo_id: selectedGrupo
                        })
                    });

                    if (!grupoResponse.ok) {
                        const error = await grupoResponse.json().catch(() => ({}));
                        console.error('Error al asignar grupo:', error);
                        alert('Usuario creado pero hubo un error al asignar el grupo');
                    }
                }

                
                alert('✅ ' + userData.rol + ' registrado correctamente' + (form.rol === 'Estudiante' && selectedGrupo ? ' y asignado al grupo' : ''));
                navigate('/home');
                return;
            } catch (error) {
                console.error('Error en la solicitud:', error);
                attempts++;

                if (attempts < maxAttempts) {
                    alert(`‼️ Error en la conexión con el servidor. Reintentando (${attempts}/${maxAttempts})`);
                } else {
                    if (error.message.includes('Failed to fetch')) {
                        alert('‼️ No se puede conectar al servidor. Por favor, verifica que el servidor está corriendo');
                    } else {
                        alert('‼️ Error: ' + error.message);
                    }
                    return;
                }
            }
        }
    };


    return (
        <div className="login-container">
            <div className="login-container-title">
                <span>Registro de Usuario</span>
            </div>
            <form onSubmit={handleSubmit} className="login-container-form">

                <label className="login-form-input-label">Rol</label>
                <select
                    name="rol"
                    className="login-form-input-field"
                    required
                    value={form.rol}
                    onChange={handleChange}
                >
                    <option value="Estudiante">Estudiante</option>
                    <option value="Secretaria">Secretaria</option>
                    <option value="Rector">Rector</option>
                    <option value="Coordinador">Coordinador</option>
                    <option value="Profesor">Profesor</option>
                    <option value="TutorLegal">Tutor Legal</option>
                </select>

                <label className="login-form-input-label">Documento de Identidad</label>
                <input
                    type="text"
                    name="documento"
                    placeholder="Número de documento"
                    className="login-form-input-field"
                    required
                    value={form.documento}
                    onChange={handleChange}
                />

                <label className="login-form-input-label">Nombres</label>
                <input
                    type="text"
                    name="nombres"
                    placeholder="Nombres completos"
                    className="login-form-input-field"
                    required
                    value={form.nombres}
                    onChange={handleChange}
                />

                <label className="login-form-input-label">Apellidos</label>
                <input
                    type="text"
                    name="apellidos"
                    placeholder="Apellidos completos"
                    className="login-form-input-field"
                    required
                    value={form.apellidos}
                    onChange={handleChange}
                />

                <label className="login-form-input-label">Teléfono</label>
                <input
                    type="tel"
                    name="telefono"
                    placeholder="Número de teléfono"
                    className="login-form-input-field"
                    required
                    value={form.telefono}
                    onChange={handleChange}
                />

                <label className="login-form-input-label">Correo Institucional</label>
                <input
                    type="email"
                    name="correo"
                    placeholder="@ieluiscarlosgalansarmiento.edu.co"
                    className="login-form-input-field"
                    required
                    value={form.correo}
                    onChange={handleChange}
                />

                <label className="login-form-input-label">Contraseña</label>
                <input
                    type="password"
                    name="contraseña"
                    placeholder="Crea una contraseña segura"
                    className="login-form-input-field"
                    required
                    minLength={8}
                    value={form.contraseña}
                    onChange={handleChange}
                />

                {form.rol === 'Estudiante' && (
                    <>
                        <label className="login-form-input-label">Grupo</label>
                        <select
                            name="grupo_id"
                            className="login-form-input-field"
                            value={selectedGrupo}
                            onChange={handleGrupoChange}
                            required={form.rol === 'Estudiante'}
                            disabled={loadingGrupos}
                        >
                            <option value="">Seleccione un grupo</option>
                            {grupos.map(grupo => (
                                <option key={grupo.id} value={grupo.id}>
                                    {grupo.nombre} - {grupo.grado_nombre}
                                </option>
                            ))}
                        </select>
                        {loadingGrupos && <p>Cargando grupos...</p>}
                    </>
                )}

                <div className="login-button-container">
                    <PrimaryButton
                        type="submit"
                        text={loading ? 'Registrando...' : 'Registrar'}
                        disabled={loading}
                    />
                </div>
            </form>
        </div>
    );
}

export default RegisterUsuario;
