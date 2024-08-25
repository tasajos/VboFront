import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { auth } from './firebase';  // Asegúrate de que la ruta es correcta
import { onAuthStateChanged, signOut } from 'firebase/auth';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import SignUp from './components/Auth/SignUp';
import SignIn from './components/Login/SignIn';
import SituacionActual from './components/SituacionActual/Situacion';
import Dashboard from './components/Portal/Dashboard';
import Solicitudes from './components/Emergencias/Solicitudes/EmerSol';
import TablaEmergencias from './components/Emergencias/Atenciones/AtencionesEmergencias';
import EditarEmergencia from './components/Emergencias/Solicitudes/EditarEmergencia';
import Operaciones from './components/Emergencias/Operaciones/Operaciones';
import RegistroUsuario from './components/Usuarios/RegistroUsuarios';
import ListaUsuario from './components/Usuarios/ListaUsuario';
import Eventos from './components/Voluntarios/EventosV0';
import RegistrarOportunidades from './components/Voluntarios/RegistrarOportunidades';
import ListaEventos from './components/Voluntarios/ListaEventos';
import ListaOportunidades from './components/Voluntarios/ListaOportunidades';
import Validacion from './components/Login/validacion';
import Formul201 from './components/Informes/form201';
import Formul202 from './components/Informes/form202';
import Formul203 from './components/Informes/form203';
import Formul204 from './components/Informes/form204';
import Formul205 from './components/Informes/form205';
import Formul205b from './components/Informes/form205b';
import Formul206 from './components/Informes/form206';
import Formul207 from './components/Informes/form207';
import Formul211 from './components/Informes/form211';
import Formul214 from './components/Informes/form214';
import Formul215 from './components/Informes/form215';
import Formul221 from './components/Informes/form221';
import Formulpreviw from './components/Informes/preview';
import Formulpreviw202 from './components/Informes/preview202';
import Formulpreviw203 from './components/Informes/preview203';
import Formulpreviw205 from './components/Informes/preview205';
import Formulpreviw204 from './components/Informes/preview204';
import Formulpreviw205b from './components/Informes/preview205b';
import Formulpreviw206 from './components/Informes/preview206';
import Formulpreviw207 from './components/Informes/preview207';
import Formulpreviw211 from './components/Informes/preview211';
import Formulpreviw215 from './components/Informes/preview215';
import Formulpreviw214 from './components/Informes/preview214';
import Formulpreviw221 from './components/Informes/preview221';
import ReportePersonalSc from './components/Informes/Reportepersonal';
import Reportesc from './components/Informes/ReporteSCI';
import Reportescp from './components/Informes/ReportePersonalTabla';
import RegistrarU from './components/Voluntarios/RegistrarUnidad';
import ListarUnidades from './components/Voluntarios/ListarUnidades';
import ReporteEmergencias from './components/Emergencias/ReporteEmergencia/ReporteEmergencia';
import NavBar from './components/NavBar/navbar';
import AdminEprDashboard from './components/Epr/AdminEprDashboard'; // Nueva página para Administrador EPR


//Fundacion
import RegistrarPersonal from './components/Fundacion/Personal/RegistrarPersonal';
import ListarPersonal from './components/Fundacion/Personal/ListarPersonal'; 
import SeguimientoPersonal from './components/Fundacion/Personal/SeguimientoPersonal'; 
import CertCapac from './components/Fundacion/Capacitacion/CertificadoForm'; 
import RegOpe from './components/Fundacion/Operaciones/RegistroOperaciones'; 

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = () => {
    signOut(auth).then(() => {
      setCurrentUser(null);
    }).catch((error) => {
      console.error("Error al cerrar sesión:", error);
    });
  };

  return (
    <Router>
      <div className="App">
       {/*} <NavBar handleSignOut={handleSignOut} /> {/* Pasar handleSignOut como prop */}
        <Routes>
          {/*<Route path="/" element={currentUser ? <Dashboard /> : <Navigate replace to="/signin" />} />*/}
          <Route path="/" element={currentUser ? <Dashboard /> : <Navigate replace to="/signin" />} />
          <Route path="/signup" element={!currentUser ? <SignUp /> : <Navigate replace to="/" />} />
          <Route path="/signin" element={!currentUser ? <SignIn /> : <Navigate replace to="/" />} />
          <Route path="/situacion-actual" element={<SituacionActual />} />
          <Route path="/inicio" element={<Dashboard />} />
          <Route path="/solicitudes" element={<Solicitudes />} />
          <Route path="/editar/:id" element={<EditarEmergencia />} />
          <Route path="/AtencionesEmergencias" element={<TablaEmergencias />} />
          <Route path="/RegistroUsuario" element={<RegistroUsuario />} />
          <Route path="/ListaUsuario" element={<ListaUsuario />} />
          <Route path="/Eventos" element={<Eventos />} />
          <Route path="/RegOp" element={<RegistrarOportunidades />} />
          <Route path="/ListEvent" element={<ListaEventos />} />
          <Route path="/ListOport" element={<ListaOportunidades />} />
          <Route path="/ListOperaciones" element={<Operaciones />} />
          <Route path="/validacion" element={<Validacion />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/forminci201" element={<Formul201 />} />
          <Route path="/forminci202" element={<Formul202 />} />
          <Route path="/forminci203" element={<Formul203 />} />
          <Route path="/forminci204" element={<Formul204 />} />
          <Route path="/forminci205" element={<Formul205 />} />
          <Route path="/forminci205b" element={<Formul205b />} />
          <Route path="/forminci207" element={<Formul207 />} />
          <Route path="/forminci206" element={<Formul206 />} />
          <Route path="/forminci211" element={<Formul211 />} />
          <Route path="/forminci214" element={<Formul214 />} />
          <Route path="/forminci215" element={<Formul215 />} />
          <Route path="/forminci221" element={<Formul221 />} />
          <Route path="/formpreview" element={<Formulpreviw />} />
          <Route path="/formpreview2" element={<Formulpreviw202 />} />
          <Route path="/formpreview3" element={<Formulpreviw203 />} />
          <Route path="/formpreview205" element={<Formulpreviw205 />} />
          <Route path="/formpreview204" element={<Formulpreviw204 />} />
          <Route path="/formpreview205b" element={<Formulpreviw205b />} />
          <Route path="/formpreview206" element={<Formulpreviw206 />} />
          <Route path="/formpreview207" element={<Formulpreviw207 />} />
          <Route path="/formpreview211" element={<Formulpreviw211 />} />
          <Route path="/formpreview214" element={<Formulpreviw214 />} />
          <Route path="/formpreview215" element={<Formulpreviw215 />} />
          <Route path="/formpreview221" element={<Formulpreviw221 />} />
          <Route path="/reportepersonal" element={<ReportePersonalSc />} />
          <Route path="/reportegral" element={<Reportesc />} />
          <Route path="/reportegralpersonal" element={<Reportescp />} />
          <Route path="/registrarU" element={<RegistrarU />} />
          <Route path="/listarUn" element={<ListarUnidades />} />
          <Route path="/listarreporteE" element={<ReporteEmergencias />} />
          <Route path="/admin-epr-dashboard" element={<AdminEprDashboard />} />

          {/* Fundacion */}

          <Route path="/regpersoF" element={<RegistrarPersonal />} />
          <Route path="/listpersoF" element={<ListarPersonal />} />
          <Route path="/segpersonal" element={<SeguimientoPersonal />} />
          <Route path="/certgene" element={<CertCapac />} />
          <Route path="/rgope" element={<RegOpe />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;
