import { Routes, Route } from "react-router-dom"; // Importar componentes de react-router-dom para manejar las rutas
import Login from "./pages/login"; // Importar componente de login
import RegisterUser from "./pages/secretariat/registerUser"; // Importar componente de registro de usuario
import DeleteUser from "./pages/secretariat/deleteUser"; // Importar componente de eliminación de usuario
import Home from "./pages/home"; // Importar componente de home
import MainLayout from "./components/MainLayout"; // Importar componente de layout
import Recoverypass from "./pages/recoverypass"; // Importar componente de recuperar contraseña
import UpdatePass from "./pages/updatepass"; // Importar componente de cambiar contraseña
import Profile from "./pages/profile"; // Importar componente de perfil
import EditProfile from "./pages/editprofile"; // Importar componente de editar perfil
import ChangePass from "./pages/changepass"; // Importar componente de cambiar contraseña

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} /> {/* Ruta de login */}
        <Route path="/recoverypass" element={<Recoverypass />} /> {/* Ruta de recuperar contraseña */}
        <Route path="/changepass" element={<ChangePass />} /> {/* Ruta de cambiar contraseña */}
        <Route element={<MainLayout />}> {/* Rutas en las que se carga el layout (menú dinámico) */}
          <Route path="/home" element={<Home />} /> {/* Ruta de home */}
          <Route path="/register-user" element={<RegisterUser />} /> {/* Ruta de registro de usuario */}
          <Route path="/delete-user" element={<DeleteUser />} /> {/* Ruta de eliminación de usuario */}
          <Route path="/updatepass" element={<UpdatePass />} /> {/* Ruta de cambiar contraseña */}
          <Route path="/profile" element={<Profile />} /> {/* Ruta de perfil */}
          <Route path="/editprofile" element={<EditProfile />} /> {/* Ruta de editar perfil */}
          <Route path="*" element={ 
            <div className='container'>
              <div className='login-container-title'>
                <span>404</span>
              </div>
              <div className='login-container-title'>
                <span>Página en desarrollo o no encontrada</span>
              </div>
            </div>
          } /> {/* Ruta de error */}
        </Route>
      </Routes>
    </>
  )
}

export default App
