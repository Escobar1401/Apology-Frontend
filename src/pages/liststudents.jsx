/*
🔴 Modulo 04: Gestión de Estudiantes 🔴

RF-07: El sistema debe permitir a la secretaría buscar a un estudiante en la base de datos.
RF-09: El sistema debe permitir a la secretaria acceder a la lista de estudiantes de cada grupo.
RF-10: El sistema debe permitir a la secretaria acceder a una lista de los grados de la institución.
RF-11: El sistema debe permitir a la secretaria acceder al perfil del estudiante.
RF-021: El sistema debe permitir al rector buscar a un estudiante en la base de datos.
RF-23: El sistema debe permitir al rector acceder a la lista de estudiantes de cada grupo.
RF-24: El sistema debe permitir al rector acceder a una lista de los grados de la institución.
RF-25: El sistema debe permitir al rector acceder al perfil del estudiante.
RF-35: El sistema debe permitir al coordinador buscar a un estudiante en la base de datos.
RF-37: El sistema debe permitir al coordinador acceder a la lista de estudiantes de cada grupo.
RF-38: El sistema debe permitir al coordinador acceder a una lista de los grados de la institución.
RF-39: El sistema debe permitir al coordinador acceder al perfil del estudiante.
RF-41: El sistema debe permitir al profesor buscar a un estudiante en la base de datos.
RF-53: El sistema debe permitir al profesor acceder a una lista de los grados de la institución.
RF-54: El sistema debe permitir al profesor acceder a la lista de estudiantes de cada grupo.
RF-55: El sistema debe permitir al profesor acceder al perfil del estudiante.
RF-78: El sistema debe permitir al tutor legal acceder a un listado de los estudiantes de los que es responsable.
RF-79: El sistema debe permitir al tutor legal ver el perfil del estudiante.

En este modulo le daremos cumplimiento a el requerimiento funcional RF-07, RF-09, RF-10, RF-11, RF-21, RF-23, RF-24, RF-25, RF-35, RF-37, RF-38, RF-39, RF-41, RF-53, RF-54, RF-55, RF-78 y RF-79.
*/

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar'; // Componente de barra de búsqueda
import ImageProfile from '../components/ImageProfile'; // Componente de imagen de perfil
import QuaternaryButton from '../components/QuaternaryButton'; // Componente de botón cuaternario
import PrimaryButton from '../components/PrimaryButton'; // Componente de botón primario
import './login.css'; // Hoja de estilos
import Modal from '../components/Modal';

function ListStudents() { // Componente principal
  const navigate = useNavigate(); // Hook para navegación
  const [busqueda, setBusqueda] = useState(''); // Estado para la búsqueda del estudiante
  const [estudiantes, setEstudiantes] = useState([]); // Estado para los estudiantes
  const [resultados, setResultados] = useState([]); // Estado para los resultados de la búsqueda
  const [seleccionado, setSeleccionado] = useState(null); // Estado para el estudiante seleccionado
  const [busquedaRealizada, setBusquedaRealizada] = useState(false); // Estado para la búsqueda realizada

  const [grupos, setGrupos] = useState([]); // Estado para los grupos
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(''); // Estado para el grupo seleccionado
  const [loadingGrupos, setLoadingGrupos] = useState(false); // Estado para la carga de los grupos
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(false); // Estado para la carga de los estudiantes
  const [error, setError] = useState(''); // Estado para el error

  useEffect(() => { // Hook useEffect para cargar los grupos
    setLoadingGrupos(true); // Indicar que se está cargando los grupos
    fetch('http://localhost:3000/api/grupos') // URL de la API
      .then(res => res.json()) // Convertir la respuesta a JSON
      .then(data => { // Procesar la respuesta
        setGrupos(data); // Guardar los grupos en el estado
        setLoadingGrupos(false); // Indicar que la carga de grupos ha terminado
      })
      .catch(err => { // Manejar errores
        setError('Error al cargar los grupos'); // Guardar el error en el estado
        setLoadingGrupos(false); // Indicar que la carga de grupos ha terminado
      });
  }, []);

  useEffect(() => { // Hook useEffect para cargar los estudiantes
    if (!grupoSeleccionado) return; // Si no hay grupo seleccionado, no hacer nada
    setLoadingEstudiantes(true); // Indicar que se está cargando los estudiantes
    setError(''); // Limpiar el error
    fetch(`http://localhost:3000/api/grupos/grupos/${grupoSeleccionado}/estudiantes`) // URL de la API
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar estudiantes'); // Si la respuesta no es correcta, lanzar un error
        return res.json(); // Convertir la respuesta a JSON
      })
      .then(data => { // Procesar la respuesta
        setEstudiantes(data); // Guardar los estudiantes en el estado
        setResultados(data); // Guardar los resultados en el estado
        setBusquedaRealizada(true); // Indicar que la búsqueda ha sido realizada
        setLoadingEstudiantes(false); // Indicar que la carga de estudiantes ha terminado
      })
      .catch(err => { // Manejar errores
        setError('Error al cargar los estudiantes del grupo'); // Guardar el error en el estado
        setEstudiantes([]); // Limpiar los estudiantes
        setResultados([]); // Limpiar los resultados
        setLoadingEstudiantes(false); // Indicar que la carga de estudiantes ha terminado
      });
  }, [grupoSeleccionado]);

  const handleBuscar = () => { // Función para buscar estudiantes
    const criterio = busqueda.toLowerCase(); // Convertir el criterio a minúsculas
    const filtrados = estudiantes.filter(est => // Filtrar los estudiantes
      est.nombres.toLowerCase().includes(criterio) || // Buscar por nombres
      est.apellidos.toLowerCase().includes(criterio) || // Buscar por apellidos
      est.documento.toLowerCase().includes(criterio) // Buscar por documento
    );
    setResultados(filtrados); // Guardar los resultados en el estado
    setBusquedaRealizada(true); // Indicar que la búsqueda ha sido realizada
    setSeleccionado(null); // Limpiar el estudiante seleccionado
  };

  const handleSeleccionar = (estudiante) => { // Función para seleccionar un estudiante
    fetch(`http://localhost:3000/api/usuarios/${estudiante.id}`) // URL de la API
      .then(res => res.json()) // Convertir la respuesta a JSON
      .then(data => setSeleccionado(data)) // Guardar los detalles del estudiante en el estado
      .catch(err => { // Manejar errores
        console.error('Error al obtener detalles del estudiante:', err); // Mostrar el error en la consola
        setSeleccionado(estudiante); // Guardar el estudiante seleccionado en el estado
      });
  };

  const handleCerrarDetalle = () => { // Función para cerrar el detalle del estudiante
    setSeleccionado(null); // Limpiar el estudiante seleccionado
  };

  const handleGrupoChange = (e) => { // Función para cambiar el grupo
    setGrupoSeleccionado(e.target.value); // Guardar el grupo seleccionado en el estado
    setBusqueda(''); // Limpiar la búsqueda
    setSeleccionado(null); // Limpiar el estudiante seleccionado
    setResultados([]); // Limpiar los resultados
    setError(''); // Limpiar el error
  };

  return (
    <div className="login-container">
      <div className="login-container-form">
        <h1 className="login-container-form-title">Listado de Estudiantes</h1>

        {loadingGrupos ? ( // Si se está cargando los grupos
          <p>Cargando grupos...</p>
        ) : error ? ( // Si hay un error
          <div style={{ margin: '5px 0' }}>
            <p style={{ color: 'red', margin: '5px 0' }}>{error}</p>
            <QuaternaryButton text="Reintentar" onClick={() => window.location.reload()} />
          </div>
        ) : (
          <div className="filter">
            <label className="filter-select-label" htmlFor="grupo-select">Selecciona un grupo: </label>
            <select className="filter-select" id="grupo-select" value={grupoSeleccionado} onChange={handleGrupoChange}>
              <option value="">grupo</option>
              {grupos.map(grupo => ( // Mapear los grupos
                <option key={grupo.id} value={grupo.id}>{grupo.nombre}</option>
              ))}
            </select>
          </div>
        )}

        <SearchBar
          placeholder="Buscar estudiante"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          disabled={!grupoSeleccionado || loadingEstudiantes}
        />
        <QuaternaryButton text="Buscar" onClick={handleBuscar} disabled={!grupoSeleccionado || loadingEstudiantes} />

        {loadingEstudiantes && <p>Cargando estudiantes...</p>}
        {error && !loadingGrupos && ( // Si hay un error
          <div style={{ margin: '5px 0' }}>
            <p style={{ color: 'red', margin: '5px 0' }}>{error}</p>
            <QuaternaryButton text="Reintentar" onClick={() => window.location.reload()} />
          </div>
        )}

        {busquedaRealizada && !loadingEstudiantes && !error && ( // Si se ha realizado la búsqueda
          resultados.length === 0 ? (
            <p>El grupo está vacío o no hay resultados para la búsqueda.</p>
          ) : (
            <table className="list-students-table">
              <thead className="list-students-thead">
                <tr className="list-students-tr">
                  <th className="list-students-th">Documento</th>
                  <th className="list-students-th">Nombres</th>
                </tr>
              </thead>
              <tbody className="list-students-tbody">
                {resultados.map(estudiante => ( // Mapear los estudiantes
                  <tr className="list-students-tr" key={estudiante.id} onClick={() => handleSeleccionar(estudiante)} style={{ cursor: 'pointer' }}>
                    <td className="list-students-td">{estudiante.documento}</td>
                    <td className="list-students-td">{estudiante.nombres} {estudiante.apellidos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}

        {seleccionado && ( // Si se ha seleccionado un estudiante
          <Modal
            title="Detalle del Estudiante"
            content={
              <div onClick={e => e.stopPropagation()}>
                <div className="detalle-estudiante-subtitle">
                  <span className="detalle-estudiante-title">{seleccionado.nombres} {seleccionado.apellidos}</span>
                </div>
                <div className="detalle-estudiante-info">
                  <span className="detalle-estudiante-info-label">Documento:</span>
                  <span className="detalle-estudiante-info-value">{seleccionado.documento}</span>
                </div>
                <div className="detalle-estudiante-info">
                  <span className="detalle-estudiante-info-label">Nombres:</span>
                  <span className="detalle-estudiante-info-value">{seleccionado.nombres}</span>
                </div>
                <div className="detalle-estudiante-info">
                  <span className="detalle-estudiante-info-label">Apellidos:</span>
                  <span className="detalle-estudiante-info-value">{seleccionado.apellidos}</span>
                </div>
                <div className="detalle-estudiante-info">
                  <span className="detalle-estudiante-info-label">Correo:</span>
                  <span className="detalle-estudiante-info-value">{seleccionado.correo}</span>
                </div>
                <div className="detalle-estudiante-info">
                  <span className="detalle-estudiante-info-label">Teléfono:</span>
                  <span className="detalle-estudiante-info-value">{seleccionado.telefono || 'No especificado'}</span>
                </div>
                <div className="detalle-estudiante-info">
                  <span className="detalle-estudiante-info-label">Grupo:</span>
                  <span className="detalle-estudiante-info-value">{seleccionado.grupo || 'No asignado'}</span>
                </div>
                <div className="detalle-estudiante-info">
                  <QuaternaryButton 
                    text="Ver Excusas del estudiante" 
                    onClick={() => navigate(`/student-excuses/${seleccionado.id}`)} 
                    style={{ marginTop: '15px' }}
                  />
                </div>
              </div>
            }
            onClose={handleCerrarDetalle}
          />
        )}
      </div>
    </div>
  );
}

export default ListStudents;
