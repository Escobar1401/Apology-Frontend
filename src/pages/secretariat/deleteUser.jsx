/* Registro, autenticaciòn y eliminacion de usuario
RF-28, RF-42, RF-58, RF-70 y RF-82	El sistema debe permitir a la secretaria eliminar la cuenta del rector, secretaria, coordinador, profesor, estudiante y tutor legal.

En este modulo le daremos cumplimiento a el requerimiento funcional RF-28, RF-42, RF-58, RF-70 y RF-82.

- Implementacion de la eliminacion de un usuario.
- Implementacion de la busqueda de un usuario por documento.
- Implementacion de la busqueda de un usuario por rol.
- Implementacion de la busqueda de un usuario por estado.
*/

import "../login.css";
import React, { useEffect, useState } from "react";
import VerticalUserTable from '../../components/VerticalUserTable';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';

function DeleteUser() {
  // Arreglo con los roles que se pueden eliminar
  const ROLES = ['Rector', 'Secretaria', 'Coordinador', 'Profesor', 'Estudiante', 'TutorLegal'];
  // Arreglo con los estados que se pueden eliminar
  const ESTADOS = ['Activo', 'Inactivo'];

  const [usuarios, setUsuarios] = useState([]); // Arreglo con los usuarios
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState(null); // Mensaje de error
  const [search, setSearch] = useState(""); // Busqueda
  const [selectedRol, setSelectedRol] = useState(""); // Rol seleccionado
  const [selectedEstado, setSelectedEstado] = useState(""); // Estado seleccionado

  const [currentPage, setCurrentPage] = useState(1); // Pagina actual
  const [totalPages, setTotalPages] = useState(1); // Total de paginas

  useEffect(() => {
    fetch("http://localhost:3000/api/usuarios") // Fetch para obtener todos los usuarios
      .then((response) => {
        if (!response.ok) throw new Error("Error al obtener usuarios"); // Si la respuesta no es exitosa, lanzar un error
        return response.json(); // Convertir la respuesta a JSON
      })
      .then((data) => {
        setUsuarios(data); // Guardar los usuarios en el estado
        setLoading(false); // Cambiar el estado de carga a false
      })
      .catch((err) => {
        setError(err.message); // Guardar el error en el estado
        setLoading(false); // Cambiar el estado de carga a false
      });
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/usuarios/${id}`, { // Fetch para eliminar un usuario
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Error al eliminar usuario"); // Si la respuesta no es exitosa, lanzar un error
      const data = await response.json(); // Convertir la respuesta a JSON
      console.log(data); // Mostrar la respuesta en la consola
      setUsuarios((prevUsuarios) =>
        prevUsuarios.filter((usuario) => usuario.id !== id) // Filtrar los usuarios
      );
    } catch (err) {
      console.error(err); // Mostrar el error en la consola
    }
  };

  // Funciones para manejar selección de filtros
  const handleRolChange = (e) => {
    setSelectedRol(e.target.value); // Guardar el rol seleccionado
  };

  // Funcion para manejar selección de estado
  const handleEstadoChange = (e) => {
    setSelectedEstado(e.target.value); // Guardar el estado seleccionado
  };

  // Funcion para manejar paginacion
  const handlePageChange = (page) => {
    setCurrentPage(page); // Cambiar la pagina actual
  };

  // Filtrado compuesto para dropdown
  const filteredUsuarios = usuarios
    .filter((usuario) => usuario.documento.includes(search)) // Filtrar por documento
    .filter((usuario) => selectedRol === "" ? true : usuario.rol === selectedRol) // Filtrar por rol
    .filter((usuario) => selectedEstado === "" ? true : usuario.estado === selectedEstado); // Filtrar por estado

  return (
    <div className="login-container">
      {/* Barra de búsqueda */}
      <SearchBar placeholder="Buscar usuario por documento" onChange={(e) => setSearch(e.target.value)} />

      {/* Filtro de rol */}
      <div className="filter">
        <strong className="filter-title">Filtrar por rol:</strong>
        <select className="filter-select" value={selectedRol} onChange={handleRolChange}>
          <option value="">Todos</option>
          {/* Opciones de rol */}
          {ROLES.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>

        {/* Filtro de estado */}
        <strong className="filter-title">Filtrar por estado:</strong>
        <select className="filter-select" value={selectedEstado} onChange={handleEstadoChange}>
          <option value="">Todos</option>
          {/* Opciones de estado */}
          {ESTADOS.map((estado) => (
            <option key={estado} value={estado}>{estado}</option>
          ))}
        </select>
      </div>

      {/* Mensaje de carga mientras se cargan los usuarios */}
      {loading && <p>Cargando usuarios...</p>}
      {/* Mensaje de error si hay un error */}
      {error && <p>Error: {error}</p>}
      {/* Tabla de usuarios filtrados */}
      {filteredUsuarios.map((usuario) => (
        <VerticalUserTable
          key={usuario.id}
          usuario={usuario}
          onDelete={handleDelete}
          showViewButton={false}
          showDeleteButton={true}
        />
      ))}
      {/* Paginación de 5 usuarios por pagina */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

export default DeleteUser;
