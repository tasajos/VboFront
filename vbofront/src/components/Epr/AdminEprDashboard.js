import React from 'react';
import { Link } from 'react-router-dom';
import './AdminEprDashboard.css';
import NavBar from '../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // Usa useNavigate en lugar de Navigate
import { auth } from '../../firebase';

function AdminEprDashboard() {

    const navigate = useNavigate(); // Utiliza useNavigate


    const handleSignOut = async () => {
        try {
          await signOut(auth);
          navigate('/signin'); // Redirigir al usuario después de cerrar sesión
          console.log('Sesión cerrada');
        } catch (error) {
          console.error('Error al cerrar sesión', error);
        }
      };


  return (
    <div>
          <NavBar handleSignOut={handleSignOut} />
    
    <div className="admin-epr-dashboard-container">
      <h1>Dashboard de Administrador EPR</h1>
   {/* 
      <div className="admin-epr-options">
        <Link to="/Eventos" className="admin-epr-option">
          Registrar Eventos
        </Link>
        <Link to="/RegOp" className="admin-epr-option">
          Registrar Oportunidades
        </Link>
        <Link to="/registrarU" className="admin-epr-option">
          Registrar Unidad
        </Link>
        <Link to="/ListEvent" className="admin-epr-option">
          Listar Eventos
        </Link>
        <Link to="/ListOport" className="admin-epr-option">
          Listar Oportunidades
        </Link>
        <Link to="/listarUn" className="admin-epr-option">
          Listar Unidades
        </Link>
      </div>*/}
    </div>
    
     </div>
  );
}

export default AdminEprDashboard;
