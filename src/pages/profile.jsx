import './login.css';
import ImageProfile from '../components/ImageProfile';
import QuaternaryButton from '../components/QuaternaryButton';
import TertiaryButton from '../components/TertiaryButton';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Profile() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const navigate = useNavigate();
  const [usuario, setUsuario] = useState({});
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.id;
        fetch(`http://localhost:3000/api/usuarios/${userId}`)
          .then(res => res.json())
          .then(data => setUsuario(data))
          .catch(err => console.error('Error al obtener usuario:', err));
      } catch (e) {
        console.error('Token inválido:', e);
      }
    }
  }, []);

  return (
    <>
      <div className="login-container">
        <form className="login-container-form">
          <span className="login-container-form-title-profile">Mi Perfil</span>
          <div className="login-container-form-subtitle-profile">
            <span className="login-container-form-title-profile">{usuario.nombres} {usuario.apellidos}</span>
          </div>
          <div className="login-container-form-image-profile">
            <ImageProfile />
          </div>
          <div className="profile-info">
            <span className="profile-info-label">Rol:</span>
            <span className="profile-info-value">{usuario.rol}</span>
          </div>
          <div className="profile-info">
            <span className="profile-info-label">Correo:</span>
            <span className="profile-info-value">{usuario.correo}</span>
          </div>
          <div className="profile-info">
            <span className="profile-info-label">Teléfono:</span>
            <span className="profile-info-value">{usuario.telefono || 'No especificado'}</span>
          </div>
          {usuario.rol === 'Estudiante' && (
            <div className="profile-info">
              <span className="profile-info-label">Grupo:</span>
              <span className="profile-info-value">{usuario.grupo || 'No asignado'}</span>
            </div>
          )}
          <div className="login-container-form-button">
            <QuaternaryButton text="Editar Perfil" onClick={() => navigate('/editprofile')} />
          </div>
          <div className="login-container-form-button">
            <QuaternaryButton text="Actualizar Contraseña" onClick={() => navigate('/updatepass')} />
          </div>
          <div className="login-container-form-button">
            <TertiaryButton
              text="Cerrar Sesión"
              onClick={() => {
                localStorage.clear();
                navigate('/');
              }}
            />
          </div>
        </form>
      </div>
    </>
  );
}

export default Profile;
