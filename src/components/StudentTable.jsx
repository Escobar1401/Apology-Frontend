import React, { useState } from 'react';
import "./VerticalUserTable.css";
import PrimaryButton from './PrimaryButton';
import Modal from './Modal';

const campos = [
    { key: 'documento', label: 'Documento' },
    { key: 'nombres', label: 'Nombres' },
    { key: 'apellidos', label: 'Apellidos' },
    { key: 'estado', label: 'Estado' },
];

const StudentTable = ({ estudiante }) => {
    const [showModal, setShowModal] = useState(false);

    const handleViewProfile = () => {
        setShowModal(true);
    };

    return (
        <>
            <table className="vertical-user-table">
                <tbody className="vertical-user-table-tbody">
                    {campos.map(({ key, label, condition, value }) => {
                        // Si hay una condición y no se cumple, no renderizar esta fila
                        if (condition && !condition(estudiante)) {
                            return null;
                        }

                        // Usar la función value si existe, de lo contrario usar el valor directo
                        const cellValue = value ? value(estudiante) : estudiante[key];

                        return (
                            <tr className="vertical-user-table-tr" key={key}>
                                <th className="vertical-user-table-th">{label}</th>
                                <td className="vertical-user-table-td">{cellValue}</td>
                            </tr>
                        );
                    })}
                    <tr className="vertical-user-table-tr" key="verPerfil">
                        <td className="vertical-user-table-view" colSpan={2}>
                            <PrimaryButton onClick={handleViewProfile} text="Ver Perfil" />
                        </td>
                    </tr>
                </tbody>
            </table>
            {showModal && (
                <Modal
                    title="Perfil del Estudiante"
                    content={
                        <>
                            <p>Nombre: {estudiante.nombres}</p>
                            <p>Apellido: {estudiante.apellidos}</p>
                            <p>Documento: {estudiante.documento}</p>
                            <p>Estado: {estudiante.estado}</p>
                            <p>Grupo: {estudiante.grupo}</p>
                            <p>Correo: {estudiante.correo}</p>
                        </>
                    }
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    );
};

export default StudentTable;