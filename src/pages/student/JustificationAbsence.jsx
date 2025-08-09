import PrimaryButton from '../../components/PrimaryButton';
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

function JustificationAbsence() {
  const [mensajeError, setMensajeError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [mensajeMaterias, setMensajeMaterias] = useState("");
  const [mensajeFecha, setMensajeFecha] = useState("");
  const [mensajeMotivo, setMensajeMotivo] = useState("");
  const [mensajeMotivoOtro, setMensajeMotivoOtro] = useState("");
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
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!userResponse.ok) throw new Error('Error al cargar datos del usuario');

        const userData = await userResponse.json();
        setUsuario(userData);

        // Si es estudiante, obtener su tutor legal
        if (userData.rol === 'Estudiante') {
          const tutorResponse = await fetch(`http://localhost:3000/api/usuarios/estudiantes/${userId}/tutor-legal`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (tutorResponse.ok) {
            const tutorData = await tutorResponse.json();
            setTutorLegal(tutorData);
          }
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setMensajeError('Error al cargar los datos del usuario');
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
    // Limpiar el mensaje de error si se selecciona al menos una materia
    if (materiasSeleccionadas.length > 0) {
      setMensajeMaterias('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset all messages
    setMensajeError('');
    setMensajeExito('');
    setMensajeMaterias('');
    setMensajeFecha('');
    setMensajeMotivo('');
    setMensajeMotivoOtro('');

    // Validate form fields
    let hasErrors = false;

    if (materiasSeleccionadas.length === 0) {
      setMensajeMaterias('Por favor seleccione al menos una materia');
      hasErrors = true;
    }

    if (!fechaInasistencia) {
      setMensajeFecha('Por favor seleccione la fecha de inasistencia');
      hasErrors = true;
    }

    if (!motivo) {
      setMensajeMotivo('Por favor seleccione un motivo');
      hasErrors = true;
    }

    if (motivo === 'Otro' && !otroMotivo.trim()) {
      setMensajeMotivoOtro('Por favor especifique el motivo de la inasistencia');
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setIsLoading(true);

    try {
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

      console.log('Sending request to:', 'http://localhost:3000/api/justificaciones');
      console.log('Form data entries:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ', pair[1]);
      }

      const response = await fetch('http://localhost:3000/api/justificaciones', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Note: Don't set Content-Type header when sending FormData
          // The browser will set it automatically with the correct boundary
        },
        body: formData
      });

      let data;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          console.error('Non-JSON response:', text);
          throw new Error(`Error en el servidor (${response.status}): ${text}`);
        }
      } catch (error) {
        console.error('Error parsing response:', error);
        throw new Error('Error al procesar la respuesta del servidor');
      }

      if (!response.ok) {
        console.error('Server error response:', data);
        throw new Error(data.error || data.message || 'Error al enviar la justificación');
      }

      // Only show success message if the request was successful
      setMensajeExito('Justificación enviada correctamente');

      // Reset form
      setFechaInasistencia('');
      setMateriasSeleccionadas([]);
      setMotivo('');
      setOtroMotivo('');
      setArchivo(null);

    } catch (error) {
      console.error('Error al enviar la justificación:', error);
      setMensajeError(error.message || 'Error al enviar la justificación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFechaChange = (e) => {
    setFechaInasistencia(e.target.value);
    // Clear fecha error when user selects a date
    if (e.target.value) {
      setMensajeFecha('');
    }
  };

  const handleMotivoChange = (e) => {
    setMotivo(e.target.value);
    // Clear motivo error when user selects a reason
    if (e.target.value) {
      setMensajeMotivo('');
    }
    // If changing from 'Otro' to something else, clear the otroMotivo error
    if (e.target.value !== 'Otro') {
      setMensajeMotivoOtro('');
    }
  };

  const handleOtroMotivoChange = (e) => {
    setOtroMotivo(e.target.value);
    // Clear otroMotivo error when user starts typing
    if (e.target.value.trim()) {
      setMensajeMotivoOtro('');
    }
  };

  return (
    <div className="login-container">
      <form className="login-container-form" onSubmit={handleSubmit}>
        <h2 className="login-form-title">Justificación de inasistencia</h2>
        <div className="login-form-container">

          {/* Mensaje de exito al enviar la justificación*/}
          {mensajeExito && (
            <div className="mensaje-exito">
              {mensajeExito}
            </div>
          )}

          {/* Mensaje de error al enviar la justificación*/}
          {mensajeError && (
            <div className="mensaje-error">
              {mensajeError}
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

          {/*Mensaje de error para seleccion de materias*/}
          {mensajeMaterias && (
            <div className="mensaje-error">
              {mensajeMaterias}
            </div>
          )}

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

          {/*Mensaje de error para seleccion de fecha*/}
          {mensajeFecha && (
            <div className="mensaje-error">
              {mensajeFecha}
            </div>
          )}

          <label className="login-form-input-label">Fecha de inasistencia *</label>
          <input
            type="date"
            className="login-form-input-field"
            value={fechaInasistencia}
            onChange={handleFechaChange}
            max={new Date().toISOString().split('T')[0]}
          />

          {/*Mensaje de error para seleccion de motivo*/}
          {mensajeMotivo && (
            <div className="mensaje-error">
              {mensajeMotivo}
            </div>
          )}

          <label className="login-form-input-label">Motivo de la inasistencia *</label>
          <select
            className="login-form-input-field"
            value={motivo}
            onChange={handleMotivoChange}
          >
            <option value="">Seleccione un motivo</option>
            <option value="Enfermedad">Enfermedad</option>
            <option value="Cita médica">Cita médica</option>
            <option value="Problemas familiares">Problemas familiares</option>
            <option value="Otro">Otro</option>
          </select>

          {/*Mensaje de error para seleccion de motivo*/}
          {mensajeMotivoOtro && (
            <div className="mensaje-error">
              {mensajeMotivoOtro}
            </div>
          )}

          {motivo === 'Otro' && (
            <>
              <label className="login-form-input-label">Especifique el motivo *</label>
              <input
                type="text"
                className="login-form-input-field"
                value={otroMotivo}
                onChange={handleOtroMotivoChange}
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


