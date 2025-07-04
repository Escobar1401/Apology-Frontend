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
    
    const [loading, setLoading] = useState(false);
    const [grupos, setGrupos] = useState([]);
    const [selectedGrupo, setSelectedGrupo] = useState('');
    const [loadingGrupos, setLoadingGrupos] = useState(false);
    // Nuevos estados para la búsqueda de estudiantes
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    // Efecto para cargar grupos cuando el rol es Estudiante
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

    // Función para buscar estudiantes
    const searchStudents = async (term) => {
        if (term.length < 3) {
            setSearchResults([]);
            return;
        }
        
        setIsSearching(true);
        try {
            const response = await fetch(`http://localhost:3000/api/usuarios/search?q=${term}&rol=Estudiante`);
            if (response.ok) {
                const data = await response.json();
                setSearchResults(data);
            }
        } catch (error) {
            console.error('Error buscando estudiantes:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        searchStudents(value);
    };

    const selectStudent = (student) => {
        setSelectedStudent(student);
        setSearchTerm(`${student.nombres} ${student.apellidos} (${student.documento})`);
        setSearchResults([]);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prevForm => ({
            ...prevForm,
            [name]: value
        }));
    };

    const handleGrupoChange = (e) => {
        setSelectedGrupo(e.target.value);
    }; 

    const handleSubmit = async (e) => {
        e.preventDefault();

        const camposObligatorios = ['documento', 'nombres', 'apellidos', 'telefono', 'correo', 'contraseña'];
        const camposVacios = camposObligatorios.some(campo => !form[campo]?.trim());

        if (camposVacios) {
            alert('‼️ Todos los campos son obligatorios');
            return;
        }

        // Validar que si es Tutor Legal, tenga un estudiante seleccionado
        if (form.rol === 'TutorLegal' && !selectedStudent) {
            alert('‼️ Debe seleccionar un estudiante para el tutor legal');
            return;
        }

        setLoading(true);

        try {
            // Crear el usuario
            const userDataToSend = {
                ...form,
                rol: form.rol || 'Estudiante'
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
                alert('‼️ ' + mensaje);
                return;
            }

            const userData = await userResponse.json();
            
            // Si es estudiante, asignar al grupo
            if (form.rol === 'Estudiante' && selectedGrupo) {
                await fetch('http://localhost:3000/api/grupos/estudiantes-grupo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        estudiante_id: userData.id,
                        grupo_id: selectedGrupo
                    })
                });
            }
            
            // Si es Tutor Legal, asignar al estudiante
            if (form.rol === 'TutorLegal' && selectedStudent) {
                await fetch('http://localhost:3000/api/tutores/estudiantes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        tutor_id: userData.id,
                        estudiante_id: selectedStudent.id
                    })
                });
            }
            
            alert(`✅ ${form.rol} registrado correctamente`);
            navigate('/home');
            
        } catch (error) {
            console.error('Error en la solicitud:', error);
            alert('‼️ Error al procesar la solicitud. Por favor, intente de nuevo.');
        } finally {
            setLoading(false);
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

                {form.rol === 'TutorLegal' && (
                    <>
                        <label className="login-form-input-label">Buscar Estudiante</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Buscar por nombre o documento"
                                className="login-form-input-field"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                disabled={!!selectedStudent}
                            />
                            {selectedStudent && (
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setSelectedStudent(null);
                                        setSearchTerm('');
                                    }}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: '#666',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ✕
                                </button>
                            )}
                            {searchResults.length > 0 && !selectedStudent && (
                                <ul style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    backgroundColor: 'white',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    zIndex: 1000,
                                    margin: '5px 0 0',
                                    padding: 0,
                                    listStyle: 'none'
                                }}>
                                    {searchResults.map(student => (
                                        <li 
                                            key={student.id}
                                            onClick={() => selectStudent(student)}
                                            style={{
                                                padding: '8px 12px',
                                                cursor: 'pointer',
                                                borderBottom: '1px solid #eee'
                                            }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                        >
                                            {student.nombres} {student.apellidos} - {student.documento}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        {isSearching && <p>Buscando estudiantes...</p>}
                        {selectedStudent && (
                            <div style={{ 
                                marginTop: '10px',
                                padding: '10px',
                                backgroundColor: '#f0f8ff',
                                borderRadius: '4px',
                                border: '1px solid #d0e3ff'
                            }}>
                                <strong>Estudiante seleccionado:</strong> {selectedStudent.nombres} {selectedStudent.apellidos} - {selectedStudent.documento}
                            </div>
                        )}
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
