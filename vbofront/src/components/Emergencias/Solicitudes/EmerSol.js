import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import { database } from '../../../firebase';
import placeholderImage from '../../../imagenes/noimagen.png';
import NavBar from '../../NavBar/navbar';
import './solicitudes.css';

function Solicitudes() {
  const [emergenciasPendientes, setEmergenciasPendientes] = useState([]);

  useEffect(() => {
    const db = getDatabase();
    const emergenciasRef = ref(db, 'ultimasEmergencias');

    const onEmergenciasChange = (snapshot) => {
      const emergenciasRaw = snapshot.val();
      const emergenciasPend = emergenciasRaw
        ? Object.keys(emergenciasRaw)
            .filter(key => emergenciasRaw[key].estado === 'Pendiente')
            .map(key => ({
              id: key,
              ...emergenciasRaw[key],
            }))
        : [];
      setEmergenciasPendientes(emergenciasPend);
    };

    onValue(emergenciasRef, onEmergenciasChange);
    return () => {
      off(emergenciasRef, 'value', onEmergenciasChange);
    };
  }, []);

  return (
    <div>
      <NavBar />
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' }}>
        {emergenciasPendientes.length > 0 ? (
          emergenciasPendientes.map((emergencia) => (
            <Card key={emergencia.id} className="custom-card">
              <a href={emergencia.imagen || placeholderImage} target="_blank" rel="noopener noreferrer">
                <Card.Img variant="top" src={emergencia.imagen || placeholderImage} />
              </a>
              <Card.Body>
                <Card.Title>{emergencia.titulo}</Card.Title>
                <Card.Text>{emergencia.descripcion}</Card.Text>
              </Card.Body>
              <ListGroup className="list-group-flush">
                <ListGroup.Item>{emergencia.ciudad}</ListGroup.Item>
                <ListGroup.Item>{emergencia.fecha} Hora: {emergencia.hora}</ListGroup.Item>
                <ListGroup.Item>Estado: {emergencia.estado}</ListGroup.Item>
                <ListGroup.Item>
                  Ubicación: <a href={emergencia.ubicacion.startsWith('http') ? emergencia.ubicacion : `https://www.google.com/maps/search/?api=1&query=${emergencia.ubicacion}`} target="_blank" rel="noopener noreferrer">Ver Mapa</a>
                </ListGroup.Item>
              </ListGroup>
              <Card.Body>
                <Card.Link href="#">Ver más</Card.Link>
              </Card.Body>
            </Card>
          ))
        ) : (
          <p>No hay emergencias pendientes.</p>
        )}
      </div>
    </div>
  );
}

export default Solicitudes;
