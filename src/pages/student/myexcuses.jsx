import { useEffect, useState, useRef } from "react";
import EyeButton from "../../components/EyeButton";
import DownloadButton from "../../components/DownloadButton";
import Modal from "../../components/Modal";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

function MyExcuses() {
    // Funcion para descargar el PDF
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

    const [excuses, setExcuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedExcuse, setSelectedExcuse] = useState(null);

    // Fetch para obtener las excusas del estudiante
    useEffect(() => {
        // Obtener el ID del estudiante del localStorage
        const studentId = localStorage.getItem('userId');
        console.log('Student ID from localStorage:', studentId);
        
        if (!studentId) {
            setError('No se encontró el ID del estudiante');
            setLoading(false);
            return;
        }

        fetch(`http://localhost:3000/api/justificaciones/estudiante/${studentId}`)
            .then((response) => {
                console.log('API response status:', response.status);
                if (!response.ok) throw new Error("Error al obtener excusas");
                return response.json();
            })
            .then((data) => {
                console.log('Excuses data received:', data);
                setExcuses(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching excuses:', err);
                  setError(err.message);
                setLoading(false);
            });
    }, []);

    return (
        <div className="login-container">
            <h2 className="login-form-title">Mis excusas</h2>

            <div className="myexcuses-container">
                <table className="myexcuses-table">
                    <tbody className="myexcuses-table-body">
                        {excuses.map((excuse) => (
                            <tr key={excuse.id} className="myexcuses-table-row">
                                <td className="myexcuses-table-td">{excuse.fecha_ausencia.split('T')[0]}</td>
                                <td className="myexcuses-table-td">{excuse.motivo}</td>
                                <td className="myexcuses-table-td">{excuse.estado}</td>
                                <td className="myexcuses-table-td-actions">
                                    <EyeButton onClick={() => setSelectedExcuse(excuse)} />
                                    <DownloadButton onClick={() => handleDownloadPdf(excuse)} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedExcuse && (
                <Modal
                    title="Detalle de la excusa"
                    content={
                        <div onClick={e => e.stopPropagation()}>
                            <p>Fecha de ausencia: {selectedExcuse?.fecha_ausencia?.split('T')[0]}</p>
                            <p>Motivo: {selectedExcuse?.motivo}</p>
                            <p>Materias: {selectedExcuse?.materia_afectadas}</p>
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
}

export default MyExcuses;