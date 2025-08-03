import PrimaryButton from '../../components/PrimaryButton';
import './JustificationAbsence.css';
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

function JustificationAbsence() {
  const [mensaje, setMensaje] = useState("");
  const [colorMensaje, setColorMensaje] = useState('red');
  const [usuario, setUsuario] = useState({});
  const [materias, setMaterias] = useState([]);
  const [tutorLegal, setTutorLegal] = useState(null);
  const [fechaInasistencia, setFechaInasistencia] = useState('');
  const [materiasSeleccionadas, setMateriasSeleccionadas] = useState([]);
  const [motivo, setMotivo] = useState('');
  const [otroMotivo, setOtroMotivo] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch para traer las materias
  useEffect(() => {
    async function fetchMaterias() {
      try {
        const response = await fetch('http://localhost:3000/api/materias');
        const data = await response.json();
        setMaterias(data);
      } catch (error) {
        console.error('Error al obtener materias:', error);
      }
    }
    fetchMaterias();
  }, []);

  // Fetch para traer el estudiante y su tutor legal
  useEffect(() => {
    async function fetchUsuario() {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.id;
        
        // Obtener datos del usuario
        const userResponse = await fetch(`http://localhost:3000/api/usuarios/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!userResponse.ok) {
          throw new Error('Error al obtener datos del usuario');
        }
        
        const userData = await userResponse.json();
        setUsuario(userData);
        
        // Obtener tutor legal del estudiante
        const tutorResponse = await fetch(`http://localhost:3000/api/usuarios/estudiantes/${userId}/tutor-legal`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (tutorResponse.ok) {
          const tutorData = await tutorResponse.json();
          setTutorLegal(tutorData);
        }
        
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setMensaje('Error al cargar los datos del usuario');
        setColorMensaje('red');
      }
    }
    
    fetchUsuario();
  }, [navigate]);

  const handleMateriaChange = (materiaId) => {
    setMateriasSeleccionadas(prev => 
      prev.includes(materiaId)
        ? prev.filter(id => id !== materiaId)
        : [...prev, materiaId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validaciones
      if (materiasSeleccionadas.length === 0) {
        throw new Error('Por favor seleccione al menos una materia');
      }

      if (!fechaInasistencia) {
        throw new Error('Por favor seleccione la fecha de inasistencia');
      }

      if (!motivo) {
        throw new Error('Por favor seleccione un motivo');
      }

      if (motivo === 'Otro' && !otroMotivo.trim()) {
        throw new Error('Por favor especifique el motivo de la inasistencia');
      }

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.id;

      const formData = new FormData();
      formData.append('estudiante_id', userId);
      formData.append('fecha_inasistencia', fechaInasistencia);
      formData.append('materias', JSON.stringify(materiasSeleccionadas));
      formData.append('motivo', motivo);
      
      if (otroMotivo) {
        formData.append('descripcion_adicional', otroMotivo);
      }
      
      if (archivo) {
        formData.append('archivo', archivo);
      }

      const response = await fetch('http://localhost:3000/api/justificaciones', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al enviar la justificación');
      }

      setMensaje('Justificación enviada correctamente');
      setColorMensaje('green');
      
      // Reset form
      setFechaInasistencia('');
      setMateriasSeleccionadas([]);
      setMotivo('');
      setOtroMotivo('');
      setArchivo(null);
      
    } catch (error) {
      console.error('Error al enviar la justificación:', error);
      setMensaje(error.message || 'Error al enviar la justificación');
      setColorMensaje('red');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-form-container">
          <h2 className="login-form-title">Justificación de inasistencia</h2>
          
          {mensaje && (
            <div className={`mensaje ${colorMensaje === 'red' ? 'error' : 'success'}`}>
              {mensaje}
            </div>
          )}
          
          <h3 className="login-form-subtitle">Datos del Estudiante</h3>
          
          <label className="login-form-input-label">Nombre</label>
          <input
            type="text"
            value={`${usuario.nombres || ''} ${usuario.apellidos || ''}`}
            className="login-form-input-field"
            readOnly
          />
          
          <label className="login-form-input-label">Documento</label>
          <input
            type="text"
            value={usuario.documento || ''}
            className="login-form-input-field"
            readOnly
          />
          
          <label className="login-form-input-label">Correo electrónico</label>
          <input
            type="email"
            value={usuario.correo || ''}
            className="login-form-input-field"
            readOnly
          />
          
          <label className="login-form-input-label">Teléfono</label>
          <input
            type="tel"
            value={usuario.telefono || ''}
            className="login-form-input-field"
            readOnly
          />
          
          <label className="login-form-input-label">Grado</label>
          <input
            type="text"
            value={usuario.grupo || 'Sin grupo asignado'}
            className="login-form-input-field"
            readOnly
          />
          
          <hr />
          
          <h3 className="login-form-subtitle">Datos del Acudiente</h3>
          
          <label className="login-form-input-label">Nombre del acudiente</label>
          <input 
            type="text" 
            value={tutorLegal ? `${tutorLegal.nombres || ''} ${tutorLegal.apellidos || ''}` : 'No asignado'}
            className="login-form-input-field" 
            readOnly 
          />
          
          <label className="login-form-input-label">Teléfono del acudiente</label>
          <input 
            type="tel" 
            value={tutorLegal?.telefono || 'No asignado'}
            className="login-form-input-field" 
            readOnly 
          />

          <hr />

          <label className="login-form-input-label">Materias a las que faltó: *</label>
          <div className="login-form-input-field-materias">
            {materias.map((materia) => (
              <label key={materia.id} className="login-form-input-field-materias-label">
                <input 
                  type="checkbox"
                  checked={materiasSeleccionadas.includes(materia.id)}
                  onChange={() => handleMateriaChange(materia.id)}
                />
                {materia.nombre}
              </label>
            ))}
          </div>

          <label className="login-form-input-label">Fecha de inasistencia *</label>
          <input 
            type="date" 
            className="login-form-input-field" 
            value={fechaInasistencia}
            onChange={(e) => setFechaInasistencia(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />

          <label className="login-form-input-label">Motivo de la inasistencia *</label>
          <select 
            className="login-form-input-field"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          >
            <option value="">Seleccione un motivo</option>
            <option value="Enfermedad">Enfermedad</option>
            <option value="Cita médica">Cita médica</option>
            <option value="Problemas familiares">Problemas familiares</option>
            <option value="Otro">Otro</option>
          </select>

          {motivo === 'Otro' && (
            <>
              <label className="login-form-input-label">Especifique el motivo *</label>
              <input
                type="text"
                className="login-form-input-field"
                value={otroMotivo}
                onChange={(e) => setOtroMotivo(e.target.value)}
                placeholder="Describa el motivo de la inasistencia"
              />
            </>
          )}

          <label className="login-form-input-label">Adjuntar archivo (opcional)</label>
          <input 
            type="file" 
            className="login-form-input-field" 
            onChange={(e) => setArchivo(e.target.files[0])}
            accept=".pdf,.jpg,.jpeg,.png"
          />
          {archivo && (
            <div className="archivo-seleccionado">
              Archivo seleccionado: {archivo.name}
            </div>
          )}

          <div className="login-button-container">
            <PrimaryButton 
              text={isLoading ? 'Enviando...' : 'Enviar justificación'} 
              type="submit"
              disabled={isLoading}
            />
          </div>
          
          <p className="campo-requerido-nota">* Campos obligatorios</p>
        </div>
      </form>
    </div>
  );
}

export default JustificationAbsence;
