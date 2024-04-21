import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { auth } from '../../firebase';
import NavBar from '../NavBar/navbar';
import { signOut } from 'firebase/auth';
import Card from 'react-bootstrap/Card';
import { Navigate } from 'react-router-dom'; // Importa Navigate en lugar de Redirect
import './Dashboard.css';

const Dashboard = () => {
  const [totalsByType, setTotalsByType] = useState({});
  const [mensaje, setMensaje] = useState('');
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    const db = getDatabase();
    const emergenciasRef = ref(db, 'ultimasEmergencias');

    const onEmergenciasChange = (snapshot) => {
      const emergenciasRaw = snapshot.val();
      const totals = {};

      for (const key in emergenciasRaw) {
        const tipo = emergenciasRaw[key].tipo;
        if (tipo in totals) {
          totals[tipo]++;
        } else {
          totals[tipo] = 1;
        }
      }

      setTotalsByType(totals);
    };

    onValue(emergenciasRef, onEmergenciasChange);
    return () => off(emergenciasRef, 'value', onEmergenciasChange);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setRedirect(true); // Redirigir al usuario después de cerrar sesión
      console.log('Sesión cerrada');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

  if (redirect) {
    return <Navigate to="/signin" />; // Usa Navigate en lugar de Redirect
  }

  return (
    <div>
      <NavBar handleSignOut={handleSignOut} />
      <h1>Bienvenido al Portal de Administración</h1>
      <h3>Voluntarios de Bolivia</h3>

      {/* Mostrar Totales por Tipo */}
      <div className="totals-container">
        {Object.entries(totalsByType).map(([tipo, total], index) => (
          <Card
            key={tipo}
            style={{
              width: '18rem',
              margin: '30px 10px 0 10px',
              backgroundColor: getBackgroundColor(index),
            }}
            className="mb-2"
          >
            <Card.Header>{tipo}</Card.Header>
            <Card.Body>
              <Card.Title>Total: {total}</Card.Title>
            </Card.Body>
          </Card>
        ))}
      </div>
    </div>
  );
};

function getBackgroundColor(index) {
  const colors = ['lightblue', 'lightgreen', 'lightyellow', 'lightcoral', 'lightsalmon', 'lightseagreen', 'lightcyan'];
  return colors[index % colors.length];
}

export default Dashboard;
