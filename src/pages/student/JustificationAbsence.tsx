import './JustificationAbsence.css';
import PrimaryButton from '../../components/PrimaryButton';

const JustificacionInasistencias = () => {
  return (
    <div className="login-container">
      <div className="login-container-form">
        <h2 className="login-container-form-title">Justificación de Inasistencia</h2>

        {/* Datos del Estudiante */}
        <label className="login-form-input-label">Nombre del estudiante</label>
        <input type="text" className="login-form-input-field" />

        <label className="login-form-input-label">Apellido</label>
        <input type="text" className="login-form-input-field" />

        <label className="login-form-input-label">Correo</label>
        <input type="email" className="login-form-input-field" />

        <label className="login-form-input-label">Teléfono</label>
        <input type="tel" className="login-form-input-field" />

        <label className="login-form-input-label">Edad</label>
        <input type="number" className="login-form-input-field" />

        <hr style={{ margin: '20px 0', borderColor: 'var(--primary-text-color)' }} />

        {/* Datos del Acudiente */}
        <label className="login-form-input-label">Nombre del acudiente</label>
        <input type="text" className="login-form-input-field" />

        <label className="login-form-input-label">Apellido</label>
        <input type="text" className="login-form-input-field" />

        <label className="login-form-input-label">Correo</label>
        <input type="email" className="login-form-input-field" />

        <label className="login-form-input-label">Teléfono</label>
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

        <label className="login-form-input-label">Motivo</label>
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
