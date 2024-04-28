import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, onValue, off, update } from 'firebase/database';
import NavBar from '../../NavBar/navbar';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import './Operaciones.css';

function Operaciones() {
  const navigate = useNavigate();
  const [emergencias, setEmergencias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const db = getDatabase();
    const emergenciasRef = ref(db, 'ultimasEmergencias');

    const onEmergenciasChange = (snapshot) => {
      const emergenciasRaw = snapshot.val();
      const emergenciasList = emergenciasRaw ? Object.keys(emergenciasRaw).map(key => {
        const emergenciaData = emergenciasRaw[key];
        const historial = emergenciaData.historial
          ? Object.keys(emergenciaData.historial).map(historialKey => ({
              id: historialKey,
              ...emergenciaData.historial[historialKey]
            }))
          : [];
        return {
          id: key,
          ...emergenciaData,
          historial
        };
      }).filter(emergencia => emergencia.estado === 'Activo') : [];
      setEmergencias(emergenciasList);
    };

    onValue(emergenciasRef, onEmergenciasChange);
    return () => off(emergenciasRef, 'value', onEmergenciasChange);
  }, []);

  const handleActualizarEstado = (id, nuevoEstado) => {
    const db = getDatabase();
    const emergenciaRef = ref(db, `ultimasEmergencias/${id}`);
    update(emergenciaRef, { estado: nuevoEstado })
      .then(() => {
        setMensaje('Estado actualizado correctamente.');
        setTimeout(() => setMensaje(''), 3000);
        window.location.reload();
      })
      .catch(error => {
        console.error("Error al actualizar el estado:", error);
        setMensaje('Error al actualizar el estado.');
        setTimeout(() => setMensaje(''), 3000);
      });
  };

  const renderCardsEmergencias = () => (
    <Row>
      {emergencias.map((emergencia) => {
        let fechaUltimaActualizacion = 'No especificado';
        if (emergencia.historial && emergencia.historial.length > 0) {
          const ultimaFecha = Math.max(...emergencia.historial.map(e => e.timestamp));
          fechaUltimaActualizacion = new Date(ultimaFecha).toLocaleString();
        } else if (emergencia.fecha) {
          fechaUltimaActualizacion = new Date(emergencia.fecha).toLocaleString();
        }

        return (
          <Col md={4} className="mb-4" key={emergencia.id}>
            <Card className="shadow-sm h-100">
              <Card.Header as="h5">{emergencia.Titulo || 'No especificado'}</Card.Header>
              <Card.Body>
                <Card.Subtitle className="mb-2 text-muted">
                  {emergencia.ciudad || 'No especificado'}
                </Card.Subtitle>
                <Card.Text>{emergencia.descripcion || 'No especificado'}</Card.Text>
              </Card.Body>
              <ListGroup variant="flush">
                {emergencia.historial?.map((itemHistorial) => (
                  <ListGroup.Item
                    key={itemHistorial.id}
                    className={`d-flex justify-content-between align-items-center ${itemHistorial.subestado === 'Completado' ? 'list-group-item-success text-dark' : 'text-dark'}`}
                  >
                    Hist. Estado: {itemHistorial.subestado}
                    <span className="badge badge-secondary badge-pill text-dark">
                      {new Date(itemHistorial.timestamp).toLocaleString()}
                    </span>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <Card.Footer>
                <small className="text-muted">
                  Última actualización: {fechaUltimaActualizacion}
                </small>
              </Card.Footer>
            </Card>
          </Col>
        );
      })}
    </Row>
  );

  return (
    <Container style={{ maxWidth: '80%' }} className="mt-5">
      <NavBar />
      {mensaje && <div className="alert alert-info">{mensaje}</div>}
      <input
        type="text"
        placeholder="Buscar emergencias..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value.toLowerCase())}
        className="form-control mb-3"
      />
      {renderCardsEmergencias()}
    </Container>
  );
}

export default Operaciones;