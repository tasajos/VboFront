import React from 'react';
import { Link } from 'react-router-dom';
import './AdminEprDashboard.css';
import NavBar from '../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // Usa useNavigate en lugar de Navigate
import { auth } from '../../firebase';


function VoluntarioEPRDashboard() {
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
      <h1>Dashboard de Voluntario EPR</h1>
  
    </div>
    
     </div>
  );
}

export default VoluntarioEPRDashboard;
