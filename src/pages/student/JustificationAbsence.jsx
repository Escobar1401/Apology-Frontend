import PrimaryButton from '../../components/PrimaryButton';
import './JustificationAbsence.css';
import { useEffect, useState } from "react";
import React from 'react';

function JustificacionInasistencias() {
  const [mensaje, setMensaje] = useState("");
  const [colorMensaje, setColorMensaje] = useState('red');
  const [usuario, setUsuario] = useState({});

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

  return (
    <div className="login-container">
      <div className="login-container-form">
        <h2 className="login-container-form-title">Justificación de Inasistencia</h2>

        {mensaje && (
          <div style={{ color: colorMensaje, marginBottom: '10px', fontWeight: 'bold' }}>{mensaje}</div>
        )}


        <h2 className="login-container-form-title">Datos del Estudiante</h2>
        <label className="login-form-input-label">Correo institucional</label>
        <input
          type="email"
          name="correo_actual"
          placeholder={usuario.correo}
          className="login-form-input-field"
          readOnly
        />

        <label className="login-form-input-label">Nombres</label>
        <input
          type="text"
          name="nombres_estudiante"
          placeholder={usuario.nombres}
          className="login-form-input-field"
          readOnly
        />

        <label className="login-form-input-label">Apellidos</label>
        <input
          type="text"
          name="apellidos_estudiante"
          placeholder={usuario.apellidos}
          className="login-form-input-field"
          readOnly
        />

        <label className="login-form-input-label">Teléfono</label>
        <input
          type="email"
          name="telefono_estudiante"
          placeholder={usuario.telefono}
          className="login-form-input-field"
          readOnly
        />

        <label className="login-form-input-label">Grado</label>
        <input
          type="text"
          name="grado_estudiante"
          placeholder={usuario.grupo}
          className="login-form-input-field"
          readOnly
        />

        <label className="login-form-input-label">Edad</label>
        <input
          type="number"
          name="edad_estudiante"
          placeholder="Edad del estudiante"
          className="login-form-input-field"
        />

        <hr style={{ margin: '20px 0', borderColor: 'var(--primary-text-color)' }} />

        {/* Datos del Acudiente */}
        <h2 className="login-container-form-title">Datos del Acudiente</h2>
        <label className="login-form-input-label">Nombre del acudiente</label>
        <input type="text" className="login-form-input-field" />

        <label className="login-form-input-label">Apellidos del acudiente</label>
        <input type="text" className="login-form-input-field" />

        <label className="login-form-input-label">Correo del acudiente</label>
        <input type="email" className="login-form-input-field" />

        <label className="login-form-input-label">Teléfono del acudiente</label>
        <input type="tel" className="login-form-input-field" />

        <hr style={{ margin: '20px 0', borderColor: 'var(--primary-text-color)' }} />

        {/* Materias (simuladas) */}
        <label className="login-form-input-label">Materias a las que faltó:</label>
        <div style={{ marginBottom: '15px' }}>
          {['Matemáticas', 'Geometria', 'Estadistica', 'Fisica', 'Biologia', 'Quimica', 'Historia', 'Ciencias Sociales', 'Etica y Valores', 'Educacion Fisica', 'Religion', 'Inglés'].map((materia, index) => (
            <label key={index} style={{ display: 'block', marginBottom: '5px' }}>
              <input type="checkbox" style={{ marginRight: '8px' }} />
              {materia}
            </label>
          ))}
        </div>

        {/* Fecha y motivo */}
        <label className="login-form-input-label">Fecha de inasistencia</label>
        <input type="date" className="login-form-input-field" />

        <label className="login-form-input-label">Motivo de la inasistencia</label>
        <select className="login-form-input-field">
          <option>Enfermedad</option>
          <option>Cita médica</option>
          <option>Asunto familiar</option>
          <option>Otro</option>
        </select>

        {/* Archivo */}
        <label className="login-form-input-label">Adjuntar archivo</label>
        <input type="file" className="login-form-input-field" />

        <div className="login-button-container">
          <PrimaryButton text="Enviar justificación" />
        </div>
      </div>
    </div>
  );
};

export default JustificacionInasistencias;
