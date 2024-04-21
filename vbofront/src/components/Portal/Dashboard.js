// Portal/Dashboard.js
import React from 'react';
import { auth } from '../../firebase';
import NavBar from '../NavBar/navbar';
import { signOut } from 'firebase/auth';

import './Dashboard.css';

const Dashboard = () => {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log('Sesión cerrada');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

  return (
    <div>
       <NavBar handleSignOut={handleSignOut} />
      <h1>Bienvenido al Portal de Administracion</h1>
      <h3>Voluntarios de Bolivia</h3>
      
    
      {/* <button onClick={handleSignOut} className="logout-button">Cerrar Sesión</button>*/}

    </div>
  );
};
export default Dashboard;
