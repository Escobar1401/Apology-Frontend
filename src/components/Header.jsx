import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MenuToggleButton from "./MenuToggleButton";
import TertiaryButton from "./TertiaryButton";
import LogoutButton from "./LogoutButton";
import MenuOption from "./MenuOption";
import Modal from "./Modal";
import React from "react";
import "./Header.css";

const MenuOptionProps = {
  text: "string",
  link: "string"
};

const menuOptions = {
  Secretaria: [
    { text: "Inicio", link: "home" },
    { text: "Registrar nuevo usuario", link: "register-user" },
    { text: "Eliminar usuario", link: "delete-user" },
    { text: "Actualizar contraseña", link: "updatepass" },
    { text: "Mi perfil", link: "profile" },
    { text: "Lista de estudiantes", link: "liststudents" },
    { text: "Soporte técnico", link: "techsupport" },
  ],
  Estudiante: [
    { text: "Inicio", link: "home" },
    { text: "Actualizar contraseña", link: "updatepass" },
    { text: "Justificar inasistencia", link: "justification-absence"},
    { text: "Mi perfil", link: "profile" },
    { text: "Soporte técnico", link: "techsupport" },
  ],
  Profesor: [
    { text: "Inicio", link: "home" },
    { text: "Actualizar contraseña", link: "updatepass" },
    { text: "Mi perfil", link: "profile" },
    { text: "Lista de estudiantes", link: "liststudents" },
    { text: "Soporte técnico", link: "techsupport" },
  ],
  TutorLegal: [
    { text: "Inicio", link: "home" },
    { text: "Actualizar contraseña", link: "updatepass" },
    { text: "Mi perfil", link: "profile" },
    { text: "Soporte técnico", link: "techsupport" },
  ],
  Coordinador: [
    { text: "Inicio", link: "home" },
    { text: "Actualizar contraseña", link: "updatepass" },
    { text: "Mi perfil", link: "profile" },
    { text: "Lista de estudiantes", link: "liststudents" },
    { text: "Soporte técnico", link: "techsupport" },
  ],
  Rector: [
    { text: "Inicio", link: "home" },
    { text: "Actualizar contraseña", link: "updatepass" },
    { text: "Mi perfil", link: "profile" },
    { text: "Lista de estudiantes", link: "liststudents" },
    { text: "Soporte técnico", link: "techsupport" },
  ],
};

const Header = () => {
  const [role, setRole] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem('rol');
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  const options = role && menuOptions[role];

  return (
    <>
      <div className="header">
        <MenuToggleButton onClick={() => setMenuOpen(!menuOpen)} />
        <span className="header-title">{role ? role.toUpperCase() : ''}</span>
        <LogoutButton onClick={() => setLogoutModal(true)} />
      </div>

      <div className={`menu-dropdown ${menuOpen ? 'open' : ''}`}>
        {Array.isArray(options) && options.map((option, index) => (
          <MenuOption
            key={index}
            text={option.text}
            link={option.link}
            onClick={() => setMenuOpen(false)}
          />
        ))}
      </div>

      {logoutModal && (
        <Modal
          title="¿Seguro que desea cerrar sesión?"
          content={
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
              <div style={{ width: '100%', maxWidth: '180px' }}>
                <TertiaryButton
                  text="Salir"
                  onClick={() => {
                    localStorage.clear();
                    setLogoutModal(false);
                    navigate('/');
                  }}
                />
              </div>
            </div>
          }
          onClose={() => setLogoutModal(false)}
        />
      )}
    </>
  );
};

export default Header;
