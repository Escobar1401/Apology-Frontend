/* Registro de usuario

En este modulo le daremos cumplimiento a el requerimiento funcional RF-01, RF-15, RF-29, RF-43, RF-59 y RF-71.

- Implementacion de la creacion de un usuario.
- Si se crea un tutor legal, se debe asignar un estudiante.
- Si se crea un estudiante, se debe asignar un grupo.

*/

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PrimaryButton from '../../components/PrimaryButton';
import '../login.css';

function RegisterUsuario() {
    const navigate = useNavigate(); // Navegacion para redirigir a la pagina de inicio

    // Estado por defecto para el formulario
    const [form, setForm] = useState({
        documento: '',
        nombres: '',
        apellidos: '',
        telefono: '',
        correo: '',
        contraseña: '',
        rol: 'Estudiante' // Establecer 'Estudiante' como valor por defecto
    });

    const [loading, setLoading] = useState(false); // Estado de carga
    const [grupos, setGrupos] = useState([]); // Arreglo con los grupos
    const [selectedGrupo, setSelectedGrupo] = useState(''); // Grupo seleccionado
    const [loadingGrupos, setLoadingGrupos] = useState(false); // Estado de carga de grupos
    const [searchTerm, setSearchTerm] = useState(''); // Busqueda
    const [searchResults, setSearchResults] = useState([]); // Resultados de busqueda
    const [selectedStudent, setSelectedStudent] = useState(null); // Estudiante seleccionado
    const [isSearching, setIsSearching] = useState(false); // Estado de busqueda

    // Efecto para cargar grupos cuando el rol es Estudiante y TutorLegal
    useEffect(() => {
        const fetchGrupos = async () => {
            if (form.rol === 'Estudiante' || form.rol === 'TutorLegal') { // Si el rol es Estudiante o TutorLegal
                setLoadingGrupos(true); // Se activa el estado de carga
                try { // Se intenta cargar los grupos
                    const response = await fetch('http://localhost:3000/api/grupos'); // Se llama a la API para cargar los grupos
                    if (response.ok) { // Si la respuesta es exitosa
                        const data = await response.json(); // Se convierte la respuesta a JSON
                        setGrupos(data); // Se actualiza el estado de los grupos
                    } else { // Si la respuesta no es exitosa
                        console.error('Error al cargar los grupos'); // Se muestra un un mensaje de error
                    }
                } catch (error) { // Si hay un error
                    console.error('Error de conexión:', error); // Se muestra un mensaje de error
                } finally { // Finalmente
                    setLoadingGrupos(false); // Se desactiva el estado de carga
                }
            } else {
                setGrupos([]); // Se actualiza el estado de los grupos
                setSelectedGrupo(''); // Se actualiza el estado del grupo seleccionado
            }
        };
        fetchGrupos();
    }, [form.rol]);

    // Función para buscar estudiantes
    const searchStudents = async (term) => {
        if (term.length < 3) {
            setSearchResults([]); // Se actualiza el estado de los resultados de busqueda cuando el termino de busqueda es menor a 3 caracteres
            return;
        }

        setIsSearching(true); // Se activa el estado de busqueda
        try { // Se intenta buscar estudiantes
            const url = selectedGrupo
                ? `http://localhost:3000/api/usuarios/search?q=${term}&rol=Estudiante&grupoId=${selectedGrupo}` // True, si se selecciona un grupo
                : `http://localhost:3000/api/usuarios/search?q=${term}&rol=Estudiante`; // False, si no se selecciona un grupo

            const response = await fetch(url); // Se llama a la API para buscar estudiantes
            if (response.ok) { // Si la respuesta es exitosa
                const data = await response.json(); // Se convierte la respuesta a JSON
                setSearchResults(data); // Se actualiza el estado de los resultados de busqueda
            }
        } catch (error) { // Si hay un error
            console.error('Error buscando estudiantes:', error); // Se muestra un mensaje de error
        } finally {
            setIsSearching(false); // Se desactiva el estado de busqueda
        }
    };

    // Efecto para buscar estudiantes cuando cambia el grupo seleccionado
    useEffect(() => {
        if (selectedGrupo && searchTerm.length >= 3) {
            searchStudents(searchTerm); // Se llama a la funcion para buscar estudiantes
        } else {
            setSearchResults([]); // Se actualiza el estado de los resultados de busqueda
        }
    }, [selectedGrupo]);

    // Funcion para manejar cambios en el campo de busqueda
    const handleSearchChange = (e) => {
        const value = e.target.value; // Se actualiza el estado del termino de busqueda
        setSearchTerm(value); // Se actualiza el estado del termino de busqueda
        searchStudents(value); // Se llama a la funcion para buscar estudiantes
    };

    // Funcion para manejar la seleccion de un estudiante
    const selectStudent = (student) => {
        setSelectedStudent(student); // Se actualiza el estado del estudiante seleccionado
        setSearchTerm(`${student.nombres} ${student.apellidos} (${student.documento})`); // Se actualiza el estado del termino de busqueda
        setSearchResults([]); // Se actualiza el estado de los resultados de busqueda
    };

    // Funcion para manejar cambios en el campo de busqueda
    const handleChange = (e) => {
        const { name, value } = e.target; // Se actualiza el estado del campo de busqueda
        setForm(prevForm => ({ // Se actualiza el estado del formulario
            ...prevForm,
            [name]: value 
        }));
    };

    // Funcion para manejar cambios en el campo de busqueda
    const handleGrupoChange = (e) => {
        setSelectedGrupo(e.target.value); // Se actualiza el estado del grupo seleccionado
    };

    // Funcion para manejar el envio del formulario
    const handleSubmit = async (e) => {
        e.preventDefault(); // Se previene el envio del formulario en cada cambio que haga el usuario

        const camposObligatorios = ['documento', 'nombres', 'apellidos', 'telefono', 'correo', 'contraseña']; // Se definen los campos obligatorios
        const camposVacios = camposObligatorios.some(campo => !form[campo]?.trim()); // Se definen los campos vacios

        if (camposVacios) {
            alert('‼️ Todos los campos son obligatorios'); // Se muestra un mensaje de alerta si los campos obligatorios estan vacios
            return; // Se retorna para evitar que se envie el formulario
        }

        // Validar que si es Tutor Legal, tenga un estudiante seleccionado
        if (form.rol === 'TutorLegal' && !selectedStudent) {
            alert('‼️ Debe seleccionar un estudiante para el tutor legal'); // Se muestra un mensaje de alerta si no se selecciona un estudiante
            return; // Se retorna para evitar que se envie el formulario
        }

        setLoading(true); // Se activa el estado de carga

        try {
            // Crear el usuario
            const userDataToSend = {
                ...form, // Se envian los datos del formulario
                rol: form.rol || 'Estudiante' // Se envia el rol del usuario
            };

            // Se envia el usuario a la API
            const userResponse = await fetch('http://localhost:3000/api/usuarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(userDataToSend)
            });

            // Se verifica si la respuesta es exitosa
            if (!userResponse.ok) {
                const error = await userResponse.json().catch(() => ({ mensaje: 'Error desconocido' })); // Se verifica si la respuesta es exitosa
                const mensaje = error.mensaje || 'Error en el registro'; // Se verifica si la respuesta es exitosa
                alert('‼️ ' + mensaje); // Se muestra un mensaje de alerta si la respuesta no es exitosa
                return; // Se retorna para evitar que se envie el formulario
            }

            const userData = await userResponse.json(); // Se convierte la respuesta a JSON
            console.log('Usuario creado - Respuesta del servidor:', userData); // Se muestra un mensaje de alerta si la respuesta no es exitosa

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
                console.log('Intentando crear relación tutor-estudiante con:', {
                    tutor_id: userData.id,
                    estudiante_id: selectedStudent.id,
                    datosTutor: userData,
                    datosEstudiante: selectedStudent
                });
                try {
                    const relacionResponse = await fetch('http://localhost:3000/api/usuarios/tutores/estudiantes', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                            tutor_id: userData.id,
                            estudiante_id: selectedStudent.id
                        })
                    });

                    if (!relacionResponse.ok) {
                        const errorData = await relacionResponse.json().catch(() => ({}));
                        console.error('Error en la respuesta del servidor al crear la relación:', errorData);
                        throw new Error(errorData.mensaje || 'Error al crear la relación tutor-estudiante');
                    }

                    const relacionData = await relacionResponse.json();
                    console.log('Relación creada exitosamente:', relacionData);
                } catch (error) {
                    console.error('Error al crear la relación tutor-estudiante:', error);
                    alert('Se creó el tutor, pero hubo un error al asignar el estudiante. Por favor, actualice la relación manualmente.');
                }
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

                        {selectedGrupo && (
                            <>
                                <label className="login-form-input-label">Buscar Estudiante</label>
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre, apellido o documento"
                                    className="login-form-input-field"
                                    value={searchTerm}
                                    onChange={e => {
                                        const value = e.target.value;
                                        setSearchTerm(value);
                                        if (value.length < 1) {
                                            setSearchResults([]);
                                            return;
                                        }
                                        fetch(`http://localhost:3000/api/grupos/grupos/${selectedGrupo}/estudiantes`)
                                            .then(res => res.json())
                                            .then(data => {
                                                const criterio = value.toLowerCase();
                                                const filtrados = data.filter(est =>
                                                    est.nombres.toLowerCase().includes(criterio) ||
                                                    est.apellidos.toLowerCase().includes(criterio) ||
                                                    est.documento.toLowerCase().includes(criterio)
                                                );
                                                setSearchResults(filtrados);
                                            });
                                    }}
                                    disabled={!selectedGrupo || !!selectedStudent}
                                />
                                {searchResults.length > 0 && !selectedStudent && (
                                    <ul className="login-form-input-field">
                                        {searchResults.map(student => (
                                            <li
                                                key={student.id}
                                                onClick={() => {
                                                    setSelectedStudent(student);
                                                    setSearchTerm(`${student.nombres} ${student.apellidos} (${student.documento})`);
                                                    setSearchResults([]);
                                                }}
                                                style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                                                onMouseEnter={e => e.target.style.backgroundColor = '#f5f5f5'}
                                                onMouseLeave={e => e.target.style.backgroundColor = 'white'}
                                            >
                                                {student.nombres} {student.apellidos} - {student.documento}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {selectedStudent && (
                                    <div className="login-form-input-field">
                                        Estudiante seleccionado: <b>{selectedStudent.nombres} {selectedStudent.apellidos}</b> ({selectedStudent.documento})
                                        <button className="cancel-button" type="button" onClick={() => { setSelectedStudent(null); setSearchTerm(''); }}>✕</button>
                                    </div>
                                )}
                            </>
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
