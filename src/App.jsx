import { Routes, Route } from "react-router-dom"; // Importar componentes de react-router-dom para manejar las rutas
import Login from "./pages/login"; // Importar componente de login
import RegisterUser from "./pages/secretariat/registerUser"; // Importar componente de registro de usuario
import DeleteUser from "./pages/secretariat/deleteUser"; // Importar componente de eliminación de usuario
import Home from "./pages/home"; // Importar componente de home
import MainLayout from "./components/MainLayout"; // Importar componente de layout
import Recoverypass from "./pages/recoverypass"; // Importar pagina de recuperar contraseña
import UpdatePass from "./pages/updatepass"; // Importar pagina de cambiar contraseña
import Profile from "./pages/profile"; // Importar componente de perfil
import EditProfile from "./pages/editprofile"; // Importar componente de editar perfil
import ChangePass from "./pages/changepass"; // Importar componente de cambiar contraseña
import JustificationAbsence from "./pages/student/JustificationAbsence"; // Importar componente de justificación de ausencia
import ListStudents from "./pages/liststudents"; // Importar componente de lista de estudiantes
import RevisionsExcuse from "./pages/secretariat/revisionsExcuse"; // Importar componente de revisiones de excusas
import MyExcuses from "./pages/student/myexcuses"; // Importar componente de mis excusas
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
          <Route path="/justification-absence" element={<JustificationAbsence />} /> {/* Ruta de justificación de ausencia */}
          <Route path="/liststudents" element={<ListStudents />} /> {/* Ruta de lista de estudiantes */}
          <Route path="/revisions-excuse" element={<RevisionsExcuse />} /> {/* Ruta de revisiones de excusas */}
          <Route path="/myexcuses" element={<MyExcuses />} /> {/* Ruta de mis excusas */}
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
