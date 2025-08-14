import { useEffect, useState, useRef } from "react";
import EyeButton from "../../components/EyeButton";
import DownloadButton from "../../components/DownloadButton";
import Modal from "../../components/Modal";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const estadoColors = {
  Pendiente: "#fff9c4", // amarillo claro
  Rechazada: "#ffcccc", // rojo claro
  Aprobada: "#d4edda"   // verde claro
};

function RevisionsExcuse() {
  const [excuses, setExcuses] = useState([]);
  const [filteredExcuses, setFilteredExcuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editStates, setEditStates] = useState({}); // id: {estado, observaciones, saving}
  const [selectedExcuse, setSelectedExcuse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const pdfRef = useRef(null);

  // Función para aplicar los filtros
  const applyFilters = (searchTerm, estado) => {
    let filtered = [...excuses];
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(excuse => 
        (excuse.estudiante_nombres + ' ' + excuse.estudiante_apellidos).toLowerCase().includes(searchTerm)
      );
    }
    
    // Filtrar por estado
    if (estado) {
      filtered = filtered.filter(excuse => excuse.estado === estado);
    }
    
    setFilteredExcuses(filtered);
  };

  // Función para manejar cambios en la búsqueda
  const handleSearchChange = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    applyFilters(term, estadoFilter);
  };

  // Función para manejar cambios en el filtro de estado
  const handleEstadoChange = (e) => {
    const estado = e.target.value;
    setEstadoFilter(estado);
    applyFilters(searchTerm, estado);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No se encontró el token de autenticación');
      setLoading(false);
      return;
    }

    const handleSearchChange = (e) => {
      const term = e.target.value.toLowerCase();
      setSearchTerm(term);
      applyFilters(term, estadoFilter);
    };

    const handleEstadoChange = (e) => {
      const estado = e.target.value;
      setEstadoFilter(estado);
      applyFilters(searchTerm, estado);
    };

    const applyFilters = (searchTerm, estado) => {
      let filtered = [...excuses];
      
      if (searchTerm) {
        filtered = filtered.filter(excuse => 
          (excuse.estudiante_nombres + ' ' + excuse.estudiante_apellidos).toLowerCase().includes(searchTerm)
        );
      }
      
      if (estado) {
        filtered = filtered.filter(excuse => excuse.estado === estado);
      }
      
      setFilteredExcuses(filtered);
    };

    const fetchExcuses = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/justificaciones', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error('Error al obtener las excusas');
        }

        const data = await response.json();
        setExcuses(data);
        setFilteredExcuses(data); // Inicializar las excusas filtradas
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExcuses();
  }, []);

  useEffect(() => {
    applyFilters(searchTerm, estadoFilter);
  }, [excuses, searchTerm, estadoFilter]);

  useEffect(() => {
    if (initialLoad) {
      setInitialLoad(false);
      return;
    }

    if (showModal && !selectedExcuse) {
      setShowModal(false);
    }
  }, [showModal, selectedExcuse, initialLoad]);

  const handleChange = (id, field, value) => {
    setEditStates(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const handleSave = async (excuse) => {
    const edit = editStates[excuse.id];
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No se encontró el token de autenticación');
      return;
    }

    try {
      // Actualizar estado de carga
      setEditStates(prev => ({
        ...prev,
        [excuse.id]: { ...edit, saving: true }
      }));

      // Formatear la fecha al formato YYYY-MM-DD que espera el backend
      const fechaFormateada = new Date(excuse.fecha_ausencia).toISOString().split('T')[0];
      
      // Crear objeto con los campos necesarios para la actualización
      const updateData = {
        estudiante_id: excuse.estudiante_id, // Asegurarse de incluir el ID del estudiante
        fecha_ausencia: fechaFormateada, // Incluir la fecha de inasistencia formateada
        ...(edit.estado !== undefined && { estado: edit.estado }),
        ...(edit.observaciones !== undefined && { observaciones: edit.observaciones })
      };

      console.log('Enviando actualización:', updateData); // Para depuración

      const response = await fetch(`http://localhost:3000/api/justificaciones/${excuse.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const responseData = await response.json();
      console.log('Respuesta del servidor:', responseData); // Para depuración

      if (!response.ok) {
        // Si hay un mensaje de error específico del servidor, usarlo
        const errorMessage = responseData.error || responseData.message || 'Error al actualizar la excusa';
        throw new Error(errorMessage);
      }

      // Actualizar la lista de excusas con la respuesta del servidor
      setExcuses(prev => prev.map(e => e.id === excuse.id ? { ...e, ...responseData } : e));

      // Limpiar el estado de edición
      setEditStates(prev => {
        const newState = { ...prev };
        delete newState[excuse.id];
        return newState;
      });

    } catch (err) {
      console.error('Error al guardar cambios:', err);
      setError(err.message || 'Error al actualizar la excusa. Por favor, intente nuevamente.');
    } finally {
      // Asegurarse de quitar el estado de guardado incluso si hay un error
      setEditStates(prev => ({
        ...prev,
        [excuse.id]: { ...prev[excuse.id], saving: false }
      }));
    }
  };

  const handleViewExcuse = async (excuse) => {
    try {
      const token = localStorage.getItem('token');
      // Obtener materias
      const resMaterias = await fetch('http://localhost:3000/api/materias', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const materias = await resMaterias.json();
      
      // Procesar materias afectadas
      let materiasAfectadas = excuse.materias_afectadas;
      if (typeof materiasAfectadas === 'string') {
        try {
          materiasAfectadas = JSON.parse(materiasAfectadas);
        } catch (e) {
          materiasAfectadas = [];
        }
      }
      
      // Obtener nombres de las materias
      const materiasNombres = materias
        .filter(m => materiasAfectadas && materiasAfectadas.includes(m.id))
        .map(m => m.nombre);
      
      // Crear copia de la excusa con los nombres de las materias
      const excusaConMaterias = {
        ...excuse,
        materias_afectadas_nombres: materiasNombres
      };
      
      setSelectedExcuse(excusaConMaterias);
      setShowModal(true);
    } catch (error) {
      console.error('Error al cargar las materias:', error);
      // Mostrar la excusa de todas formas, aunque no tenga las materias
      setSelectedExcuse({
        ...excuse,
        materias_afectadas_nombres: []
      });
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedExcuse(null);
  };

  const handleDownloadPdf = async (excuse) => {
    // Obtener datos completos del estudiante, tutor y materias
    let estudiante = null;
    let tutor = null;
    let materiasNombres = [];
    const token = localStorage.getItem('token');
    try {
      // Fetch estudiante
      const resEst = await fetch(`http://localhost:3000/api/usuarios/${excuse.estudiante_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      estudiante = await resEst.json();
      // Fetch tutor legal
      const resTutor = await fetch(`http://localhost:3000/api/usuarios/estudiantes/${excuse.estudiante_id}/tutor-legal`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      tutor = await resTutor.json();
      // Fetch materias
      const resMaterias = await fetch('http://localhost:3000/api/materias', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const materias = await resMaterias.json();
      // Mapear los nombres de las materias afectadas
      let materiasAfectadas = excuse.materias_afectadas;
      if (typeof materiasAfectadas === 'string') {
        try {
          materiasAfectadas = JSON.parse(materiasAfectadas);
        } catch (e) {
          materiasAfectadas = [];
        }
      }
      materiasNombres = materias
        .filter(m => materiasAfectadas && materiasAfectadas.includes(m.id))
        .map(m => m.nombre);
      // Añadir nombres al excuse para usar en el template
      excuse.materias_afectadas_nombres = materiasNombres;
    } catch (err) {
      console.error('Error obteniendo datos de estudiante/tutor/materias:', err);
      excuse.materias_afectadas_nombres = [];
    }

    // Crear un div temporal para renderizar el contenido del PDF
    const pdfContent = document.createElement('div');
    pdfContent.style.position = 'absolute';
    pdfContent.style.left = '-9999px';
    pdfContent.style.padding = '20px';
    pdfContent.style.width = '210mm'; // A4 width

    // Formatear el contenido para PDF
    pdfContent.innerHTML = `
        <div style="font-family: Arial, sans-serif; background-color: #e2f1ff; padding: 20px; border-radius: 16px; box-shadow: 0 2px 8px #bcdefe;">
            <h2 style="text-align: center; background-color: #005f73; color: #ffffff; padding: 14px 10px; border-radius: 10px; margin-bottom: 24px; letter-spacing: 1px;">Formulario de Excusa</h2>
            <div style="margin: 18px 0; border-bottom: 2px solid #005f73; padding-bottom: 10px; background: #ffffff; border-radius: 8px; box-shadow: 0 1px 4px #cae2f9;">
                <h3 style="color: #005f73;">Datos del Estudiante</h3>
                <p style="color: #000; margin: 6px;"><strong style='color:#005f73;'>Nombre:</strong> ${estudiante ? estudiante.nombres + ' ' + estudiante.apellidos : 'N/A'}</p>
                <p style="color: #000; margin: 6px;"><strong style='color:#005f73;'>Documento:</strong> ${estudiante?.documento || 'N/A'}</p>
                <p style="color: #000; margin: 6px;"><strong style='color:#005f73;'>Correo:</strong> ${estudiante?.correo || 'N/A'}</p>
                <p style="color: #000; margin: 6px;"><strong style='color:#005f73;'>Teléfono:</strong> ${estudiante?.telefono || 'N/A'}</p>
                <p style="color: #000; margin: 6px;"><strong style='color:#005f73;'>Grado/Grupo:</strong> ${estudiante?.grupo || 'N/A'}</p>
            </div>
            <div style="margin: 18px 0; border-bottom: 2px solid #005f73; padding-bottom: 10px; background: #ffffff; border-radius: 8px; box-shadow: 0 1px 4px #cae2f9;">
                <h3 style="color: #005f73;">Datos del Acudiente</h3>
                <p style="color: #000; margin: 6px;"><strong style='color:#005f73;'>Nombre:</strong> ${tutor ? tutor.nombres + ' ' + tutor.apellidos : 'No asignado'}</p>
                <p style="color: #000; margin: 6px;"><strong style='color:#005f73;'>Teléfono:</strong> ${tutor?.telefono || 'No asignado'}</p>
            </div>
            <div style="margin: 18px 0; border-bottom: 2px solid #005f73; padding-bottom: 10px; background: #ffffff; border-radius: 8px; box-shadow: 0 1px 4px #cae2f9;">
                <h3 style="color: #005f73;">Datos de la Excusa</h3>
                <p style="color: #000; margin: 6px;"><strong style='color:#005f73;'>Fecha de ausencia:</strong> ${excuse.fecha_ausencia?.split('T')[0] || 'N/A'}</p>
                <p style="color: #000; margin: 6px;"><strong style='color:#005f73;'>Motivo:</strong> ${excuse.motivo || 'N/A'}</p>
                <p style="color: #000; margin: 6px;"><strong style='color:#005f73;'>Materias afectadas:</strong> ${Array.isArray(excuse.materias_afectadas_nombres) ? excuse.materias_afectadas_nombres.join(', ') : 'N/A'}</p>
                <p style="color: #000; margin: 6px;"><strong style='color:#005f73;'>Estado:</strong> ${excuse.estado || 'N/A'}</p>
                <p style="color: #000; margin: 6px;"><strong style='color:#005f73;'>Observaciones:</strong> ${excuse.observaciones || 'Ninguna'}</p>
            </div>
            <div style="margin-top: 30px; font-size: 13px; color: #8a8a8a; text-align: right;">
                <p>Fecha de creación: ${excuse.fecha_creacion?.split('T')[0] || 'N/A'}</p>
                <p>Última actualización: ${excuse.fecha_actualizacion?.split('T')[0] || 'N/A'}</p>
            </div>
        </div>
    `;

    // Anexar al body y renderizar
    document.body.appendChild(pdfContent);

    try {
      // Convertir HTML a canvas
      const canvas = await html2canvas(pdfContent, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        width: pdfContent.offsetWidth,
        height: pdfContent.offsetHeight,
        windowWidth: pdfContent.scrollWidth,
        windowHeight: pdfContent.scrollHeight
      });

      // Crear PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Agregar primera página
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Agregar nuevas páginas si el contenido es más largo de una página
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Descargar el PDF
      pdf.save(`Excusa_${excuse.fecha_ausencia?.split('T')[0] || 'sin_fecha'}.pdf`);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el PDF. Por favor, intente nuevamente.');
    } finally {
      // Limpiar
      document.body.removeChild(pdfContent);
    }
  };

  if (loading) return <div>Cargando excusas...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="login-container">
      <div className="login-container-form">
        <h2 className="login-form-title">Revisión de excusas</h2>
        <div className="myexcuses-container">
          {/* Filtros */}
          <div className="filter">
          <label className="filter-select-label" htmlFor="grupo-select">Selecciona un estado: </label>

            <select className="filter-select" value={estadoFilter} onChange={handleEstadoChange}>
              <option value="">Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Aprobada">Aprobada</option>
              <option value="Rechazada">Rechazada</option>
            </select>
          </div>

          <table className="myexcuses-table">
            <tbody className="myexcuses-table-body">
              {filteredExcuses.map((excuse) => {
                const edit = editStates[excuse.id] || { estado: excuse.estado, observaciones: excuse.observaciones || "" };
                let materias = excuse.materias_afectadas;
                if (typeof materias === 'string') {
                  try { materias = JSON.parse(materias); } catch { materias = []; }
                }
                // Si hay nombres de materias
                let materiasNombres = excuse.materias_afectadas_nombres || materias || [];
                if (Array.isArray(materiasNombres) && materiasNombres.length && typeof materiasNombres[0] !== 'string') {
                  materiasNombres = materiasNombres.map(m => m.nombre || m);
                }
                return (
                  //
                  <tr key={excuse.id} className="myexcuses-table-row" style={{ background: estadoColors[excuse.estado] || '#fff' }}>
                    <td className="myexcuses-table-td" colSpan="5" style={{ padding: '10px' }}>
                      {/* Primera línea: Nombre y fecha */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'start', gap: '5px', marginBottom: '8px', fontWeight: 'bold' }}>
                        <span>{excuse.estudiante_nombres + ' ' + excuse.estudiante_apellidos}</span>
                        <span>{excuse.fecha_ausencia?.split('T')[0]}</span>
                      </div>

                      {/* Segunda línea: Estado */}
                      <div style={{ marginBottom: '8px', width: '100%', textAlign: 'start' }}>
                        <select
                          value={edit.estado}
                          onChange={e => handleChange(excuse.id, 'estado', e.target.value)}
                          disabled={excuse.estado !== 'Pendiente'}
                          style={{
                            background: estadoColors[excuse.estado] || '#fff',
                            borderRadius: '6px',
                            padding: '5px 10px',
                            border: '1px solid #ddd',
                            width: '100%',
                            maxWidth: '200px',
                            opacity: excuse.estado !== 'Pendiente' ? 0.7 : 1,
                            cursor: excuse.estado !== 'Pendiente' ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="Aprobada">Aprobada</option>
                          <option value="Rechazada">Rechazada</option>
                        </select>
                      </div>

                      {/* Tercera línea: Observaciones */}
                      <div style={{ marginBottom: '8px' }}>
                        <textarea
                          value={edit.observaciones}
                          onChange={e => handleChange(excuse.id, 'observaciones', e.target.value)}
                          placeholder={excuse.estado !== 'Pendiente' ? 'No editable' : 'Agregar observaciones...'}
                          rows="2"
                          disabled={excuse.estado !== 'Pendiente'}
                          style={{
                            width: '100%',
                            borderRadius: '6px',
                            padding: '8px',
                            border: '1px solid #ddd',
                            resize: 'vertical',
                            minHeight: '60px',
                            opacity: excuse.estado !== 'Pendiente' ? 0.7 : 1,
                            backgroundColor: excuse.estado !== 'Pendiente' ? '#f5f5f5' : '#fff',
                            cursor: excuse.estado !== 'Pendiente' ? 'not-allowed' : 'text'
                          }}
                        />
                      </div>

                      {/* Cuarta línea: Botón */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '5px' }}>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <EyeButton onClick={() => handleViewExcuse(excuse)} />
                          <DownloadButton onClick={() => handleDownloadPdf(excuse)} />
                        </div>
                        <button
                          onClick={() => handleSave(excuse)}
                          disabled={excuse.estado !== 'Pendiente' || edit.saving}
                          style={{
                            background: excuse.estado !== 'Pendiente' ? '#cccccc' : '#005f73',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 16px',
                            cursor: excuse.estado !== 'Pendiente' ? 'not-allowed' : 'pointer',
                            fontWeight: '500',
                            transition: 'background 0.2s',
                            opacity: excuse.estado !== 'Pendiente' ? 0.7 : 1
                          }}
                          onMouseOver={(e) => {
                            if (excuse.estado === 'Pendiente' && !edit.saving) {
                              e.target.style.background = '#0a9396';
                            }
                          }}
                          onMouseOut={(e) => {
                            if (excuse.estado === 'Pendiente') {
                              e.target.style.background = '#005f73';
                            }
                          }}
                          title={excuse.estado !== 'Pendiente' ? 'Solo se pueden editar justificaciones pendientes' : ''}
                        >
                          {excuse.estado !== 'Pendiente' ? 'No editable' : (edit.saving ? 'Guardando...' : 'Guardar Cambios')}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para ver detalles de la excusa */}
      {showModal && selectedExcuse && (
        <Modal
          title="Detalle de la excusa"
          content={
            <div onClick={e => e.stopPropagation()}>
              <p>Fecha de ausencia: {selectedExcuse?.fecha_ausencia?.split('T')[0]}</p>
              <p>Motivo: {selectedExcuse?.motivo}</p>
              <p>Materias: {selectedExcuse?.materias_afectadas_nombres?.join(', ') || 'Ninguna'}</p>
              <p>Archivo adjunto: {selectedExcuse?.archivo_adjunto}</p>
              <p>Estado: {selectedExcuse?.estado}</p>
              <p>Observaciones: {selectedExcuse?.observaciones}</p>
              <p>Fecha de creación: {selectedExcuse?.fecha_creacion?.split('T')[0]}</p>
              <p>Fecha de actualización: {selectedExcuse?.fecha_actualizacion?.split('T')[0]}</p>
              <button className="cancel-button" onClick={() => setSelectedExcuse(null)}>Cerrar</button>
            </div>
          }
          onClose={() => setSelectedExcuse(null)}
        />
      )}
    </div>
  );
};

export default RevisionsExcuse;
