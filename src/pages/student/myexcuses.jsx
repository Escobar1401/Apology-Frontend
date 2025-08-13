import { useEffect, useState, useRef } from "react";
import EyeButton from "../../components/EyeButton";
import DownloadButton from "../../components/DownloadButton";
import Modal from "../../components/Modal";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

function MyExcuses() {
    // Funcion para descargar el PDF
    const handleDownloadPdf = async (excuse) => {
        // Crear un div temporal para renderizar el contenido del PDF
        const pdfContent = document.createElement('div');
        pdfContent.style.position = 'absolute';
        pdfContent.style.left = '-9999px';
        pdfContent.style.padding = '20px';
        pdfContent.style.width = '210mm'; // A4 width

        // Formatear el contenido para PDF
        pdfContent.innerHTML = `
                <div style="font-family: Arial, sans-serif;">
                    <h2 style="text-align: center; color: #2c3e50;">Formulario de Excusa</h2>
                    <div style="margin: 20px 0; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                        <h3>Datos de la Excusa</h3>
                        <p><strong>Fecha de ausencia:</strong> ${excuse.fecha_ausencia?.split('T')[0] || 'N/A'}</p>
                        <p><strong>Motivo:</strong> ${excuse.motivo || 'N/A'}</p>
                        <p><strong>Materias afectadas:</strong> ${excuse.materia_afectadas || 'N/A'}</p>
                        <p><strong>Estado:</strong> ${excuse.estado || 'N/A'}</p>
                        <p><strong>Observaciones:</strong> ${excuse.observaciones || 'Ninguna'}</p>
                    </div>
                    <div style="margin-top: 30px; font-size: 12px; color: #7f8c8d;">
                        <p>Fecha de creación: ${excuse.fecha_creacion?.split('T')[0] || 'N/A'}</p>
                        <p>Última actualización: ${excuse.fecha_actualizacion?.split('T')[0] || 'N/A'}</p>
                    </div>
                    <div style="margin-top: 50px; text-align: right;">
                        <p>___________________________________</p>
                        <p>Firma del estudiante</p>
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
        fetch("http://localhost:3000/api/justificaciones/{id}")
            .then((response) => {
                if (!response.ok) throw new Error("Error al obtener excusas");
                return response.json();
            })
            .then((data) => {
                setExcuses(data);
                setLoading(false);
            })
            .catch((err) => {
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