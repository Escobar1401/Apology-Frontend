import React, { useState } from 'react';
import './assistanceAbsence.css';

function AssistanceAbsence() {

  return (
    <div className="container">
      <div className="header">
        <h1>Registro de Asistencia</h1>
      </div>
      
      <div className="card">
        <div className="form-group">
          <div className="form-control">
            <label htmlFor="grupo">Seleccionar Grupo</label>
            <select 
              id="grupo"
              value={grupoSeleccionado}
              onChange={handleChangeGrupo}
              className="select-input"
            >
              <option value="">Seleccione un grupo</option>
              {grupos.map((grupo) => (
                <option key={grupo.id} value={grupo.id}>
                  {grupo.nombre}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-control">
            <label htmlFor="fecha">Fecha</label>
            <input
              type="date"
              id="fecha"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="date-input"
            />
          </div>
        </div>

        <div className="table-container">
          <table className="styled-table">
            <thead>
              <tr>
                <th>Nombre del Estudiante</th>
                <th>Asistencia</th>
              </tr>
            </thead>
            <tbody>
              {estudiantes.map((estudiante) => (
                <tr key={estudiante.id}>
                  <td>{estudiante.nombre}</td>
                  <td className="checkbox-cell">
                    <input
                      type="checkbox"
                      checked={estudiante.asistencia}
                      onChange={() => toggleAsistencia(estudiante.id)}
                      className="checkbox-input"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="button-container">
          <button
            className="save-button"
            onClick={handleGuardarAsistencia}
            disabled={!grupoSeleccionado}
          >
            Guardar Asistencia
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssistanceAbsence;