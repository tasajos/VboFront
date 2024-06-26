import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
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

import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
    });

  
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={currentUser ? <Dashboard /> : <Navigate replace to="/signin" />}
          />
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
        </Routes>
      </div>
    </Router>
  );
}
export default App;
