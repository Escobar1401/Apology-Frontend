import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentCard from '../components/StudentTable';
import '../pages/login.css';

function ListStudents() {
  const navigate = useNavigate();
  const [grados, setGrados] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [selectedGrado, setSelectedGrado] = useState('');
  const [selectedGrupo, setSelectedGrupo] = useState('');
  const [loading, setLoading] = useState({
    grados: false,
    grupos: false,
    estudiantes: false
  });
  const [error, setError] = useState('');

  // Cargar grados al montar el componente
  useEffect(() => {
    const fetchGrados = async () => {
      try {
        setLoading(prev => ({ ...prev, grados: true }));
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/grupos/grados', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al cargar los grados');
        }

        const data = await response.json();
        setGrados(data);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message || 'Error al cargar los grados');
      } finally {
        setLoading(prev => ({ ...prev, grados: false }));
      }
    };

    fetchGrados();
  }, []);

  // Cargar grupos cuando se selecciona un grado
  useEffect(() => {
    if (!selectedGrado) {
      setGrupos([]);
      setSelectedGrupo('');
      setEstudiantes([]);
      return;
    }

    const fetchGrupos = async () => {
      try {
        setLoading(prev => ({ ...prev, grupos: true }));
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/grupos/grados/${selectedGrado}/grupos`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al cargar los grupos');
        }

        const data = await response.json();
        setGrupos(data);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message || 'Error al cargar los grupos');
      } finally {
        setLoading(prev => ({ ...prev, grupos: false }));
      }
    };

    fetchGrupos();
  }, [selectedGrado]);

  // Cargar estudiantes cuando se selecciona un grupo
  useEffect(() => {
    if (!selectedGrupo) {
      setEstudiantes([]);
      return;
    }

    const fetchEstudiantes = async () => {
      try {
        setLoading(prev => ({ ...prev, estudiantes: true }));
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/grupos/grupos/${selectedGrupo}/estudiantes`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al cargar los estudiantes');
        }

        const data = await response.json();
        setEstudiantes(data);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message || 'Error al cargar los estudiantes');
      } finally {
        setLoading(prev => ({ ...prev, estudiantes: false }));
      }
    };

    fetchEstudiantes();
  }, [selectedGrupo, selectedGrado]);

  const handleGradoChange = (e) => {
    setSelectedGrado(e.target.value);
    setSelectedGrupo('');
    setEstudiantes([]);
  };

  const handleGrupoChange = (e) => {
    setSelectedGrupo(e.target.value);
  };

  return (
    <div className="login-container">
      <h1 className="login-container-form-title">Lista de Estudiantes</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="filter">
        <strong className="filter-title">Seleccione el grado:</strong>
        <select className="filter-select" value={selectedGrado} onChange={handleGradoChange}>
          <option value="">Todos</option>
          {grados.map((grado) => (
            <option key={grado.id} value={grado.id}>{grado.nombre}</option>
          ))}
        </select>

        <strong className="filter-title">Seleccione el grupo:</strong>
        <select className="filter-select" value={selectedGrupo} onChange={handleGrupoChange}>
          <option value="">Todos</option>
          {grupos.map((grupo) => (
            <option key={grupo.id} value={grupo.id}>{grupo.nombre}</option>
          ))}
        </select>
      </div>

      <br />

      {loading.estudiantes && <p className="loading-message">Cargando estudiantes...</p>}

      {estudiantes.length > 0 ? (
        estudiantes.map((estudiante) => (
          <StudentCard
            key={estudiante.id}
            estudiante={estudiante}
          />
        ))
      ) : selectedGrupo ? (
        <p className="no-students">No hay estudiantes registrados en este grupo.</p>
      ) : null}
    </div>
  );
}

export default ListStudents;
