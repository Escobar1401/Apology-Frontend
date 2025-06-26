import React, { useState } from 'react';
import "./VerticalUserTable.css";
import Modal from './Modal';
import PrimaryButton from './PrimaryButton';
import TertiaryButton from './TertiaryButton';

// Campos que se mostrarán y su etiqueta
const campos = [
  { key: 'documento', label: 'Documento' },
  { key: 'nombres', label: 'Nombres' },
  { key: 'apellidos', label: 'Apellidos' },
  { key: 'correo', label: 'Correo' },
  { key: 'rol', label: 'Rol' },
  { 
    key: 'grupo', 
    label: 'Grupo',
    condition: (usuario) => usuario.rol === 'Estudiante',
    value: (usuario) => usuario.grupo || 'Sin grupo asignado'
  },
  { key: 'estado', label: 'Estado' },
];


const VerticalUserTable = ({ usuario, onDelete }) => {
  const [showModal, setShowModal] = useState(false);

  const handleDelete = () => {
    setShowModal(true);
  };

  const handleConfirmDelete = () => {
    setShowModal(false);
    onDelete(usuario.id);
  };

  return (
    <>
      <table className="vertical-user-table">
        <tbody className="vertical-user-table-tbody">
          {campos.map(({ key, label, condition, value }) => {
            // Si hay una condición y no se cumple, no renderizar esta fila
            if (condition && !condition(usuario)) {
              return null;
            }
            
            // Usar la función value si existe, de lo contrario usar el valor directo
            const cellValue = value ? value(usuario) : usuario[key];
            
            return (
              <tr className="vertical-user-table-tr" key={key}>
                <th className="vertical-user-table-th">{label}</th>
                <td className="vertical-user-table-td">{cellValue}</td>
              </tr>
            );
          })}
          <tr className="vertical-user-table-tr" key="eliminar">
            <td className="vertical-user-table-delete" colSpan={2}>
              <TertiaryButton onClick={handleDelete} text="Eliminar" />
            </td>
          </tr>
        </tbody>
      </table>
      {showModal && (
        <Modal
          title="Confirmar eliminación"
          content={
            <>
              <p>¿Está seguro/a de eliminar esta cuenta?</p> 
              <p style={{ color: 'red' }}>Esta acción no se puede deshacer.</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem', width: '100%' }}>
                <PrimaryButton text="Cancelar" onClick={() => setShowModal(false)} />
                <TertiaryButton text="Eliminar" onClick={handleConfirmDelete} />
              </div>
            </>
          }
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default VerticalUserTable;
