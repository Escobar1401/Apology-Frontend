import { useEffect, useState } from "react";
import EyeButton from "../../components/EyeButton";
import DownloadButton from "../../components/DownloadButton";
import Modal from "../../components/Modal";

function MyExcuses() {
    const [excuses, setExcuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedExcuse, setSelectedExcuse] = useState(null);

    // Fetch para obtener las excusas del estudiante
    useEffect(() => {
        fetch("http://localhost:3000/api/justificaciones")
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
                                    <DownloadButton onClick={() => console.log(excuse)} />
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