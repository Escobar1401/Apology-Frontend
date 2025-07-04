import "../login.css";
import React, { useEffect, useState } from "react";
import VerticalUserTable from '../../components/VerticalUserTable';
import SearchBar from '../../components/SearchBar';

function DeleteUser() {
  // Roles y estados posibles
  const ROLES = ['Rector', 'Secretaria', 'Coordinador', 'Profesor', 'Estudiante', 'TutorLegal'];
  const ESTADOS = ['Activo', 'Inactivo']; 

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedRol, setSelectedRol] = useState("");
  const [selectedEstado, setSelectedEstado] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/api/usuarios")
      .then((response) => {
        if (!response.ok) throw new Error("Error al obtener usuarios");
        return response.json();
      })
      .then((data) => {
        setUsuarios(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/usuarios/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Error al eliminar usuario");
      const data = await response.json();
      console.log(data);
      setUsuarios((prevUsuarios) =>
        prevUsuarios.filter((usuario) => usuario.id !== id)
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Funciones para manejar selección de filtros
  const handleRolChange = (e) => {
    setSelectedRol(e.target.value);
  };

  const handleEstadoChange = (e) => {
    setSelectedEstado(e.target.value);
  };

  // Filtrado compuesto para dropdown
  const filteredUsuarios = usuarios
    .filter((usuario) => usuario.documento.includes(search))
    .filter((usuario) =>
      selectedRol === "" ? true : usuario.rol === selectedRol
    )
    .filter((usuario) =>
      selectedEstado === "" ? true : usuario.estado === selectedEstado
    );

  return (
    <div className="login-container">
      <SearchBar
        placeholder="Buscar usuario por documento"
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="filter">
        <strong className="filter-title">Filtrar por rol:</strong>
        <select className="filter-select" value={selectedRol} onChange={handleRolChange}>
          <option value="">Todos</option>
          {ROLES.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>

        <strong className="filter-title">Filtrar por estado:</strong>
        <select className="filter-select" value={selectedEstado} onChange={handleEstadoChange}>
          <option value="">Todos</option>
          {ESTADOS.map((estado) => (
            <option key={estado} value={estado}>{estado}</option>
          ))}
        </select>
      </div>

      {loading && <p>Cargando usuarios...</p>}
      {error && <p>Error: {error}</p>}
      {filteredUsuarios.map((usuario) => (
        <VerticalUserTable
          key={usuario.id}
          usuario={usuario}
          onDelete={handleDelete}
          showViewButton={false}
          showDeleteButton={true}
        />
      ))}
    </div>
  );
}

export default DeleteUser;
