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
import { signOut } from 'firebase/auth';
import { auth } from '../../../firebase';

function Operaciones() {
  const navigate = useNavigate();
  const [emergencias, setEmergencias] = useState([]);
  const [mensaje, setMensaje] = useState('');

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/signin');
      console.log('Sesión cerrada');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

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

  const renderLinkToMap = (label, location) => {
    if (!location) return 'No especificado';

    // Assumed location is in "lat,lon" format. Adjust as needed.
    const [lat, lon] = location.split(',');
    const url = `https://www.google.com/maps?q=${lat},${lon}`;
    
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px' }}>
        {label}
      </a>
    );
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
                {emergencia.fechaSCI && (
                  <div>
                    <strong>Comandante Incidente:</strong> <span style={{ fontSize: '14px' }}>{emergencia.comandanteIncidente || 'No especificado'}</span><br />
                    <strong>Acciones Tomadas:</strong> <span style={{ fontSize: '14px' }}>{emergencia.accionesTomadas || 'No especificado'}</span><br />
                    <strong>PC Ubicacion:</strong> {renderLinkToMap('Ver en Google Maps', emergencia.pcLocation)}<br />
                    <strong>ACV Ubicacion:</strong> {renderLinkToMap('Ver en Google Maps', emergencia.acvLocation)}<br />
                    <strong>Base Ubicacion:</strong> {renderLinkToMap('Ver en Google Maps', emergencia.baseLocation)}<br />
                    <strong>Campamento Ubicacion:</strong> {renderLinkToMap('Ver en Google Maps', emergencia.campamentoLocation)}<br />
                    <strong>Helipuerto:</strong> {renderLinkToMap('Ver en Google Maps', emergencia.helipuertoLocation)}<br />
                    <strong>Helipuerto 1:</strong> {renderLinkToMap('Ver en Google Maps', emergencia.helipuerto1Location)}<br />
                    <strong>Descripción Incidente:</strong> <span style={{ fontSize: '14px' }}>{emergencia.descripcionIncidente || 'No especificado'}</span><br />
                    <strong>Fecha SCI:</strong> <span style={{ fontSize: '14px' }}>{new Date(emergencia.fechaSCI).toLocaleString() || 'No especificado'}</span><br />
                    <strong>Objetivos Incidente:</strong> <span style={{ fontSize: '14px' }}>{emergencia.objetivosIncidente || 'No especificado'}</span><br />
                    
                    <strong>Recursos Asignados:</strong> <span style={{ fontSize: '14px' }}>{emergencia.recursosAsignados || 'No especificado'}</span><br />
                    <strong>Unidad Comando SCI:</strong> <span style={{ fontSize: '14px' }}>{emergencia.unidadComandoSCI || 'No especificado'}</span>
                  </div>
                )}
              </Card.Body>
              <ListGroup variant="flush">
                {emergencia.historial?.map((itemHistorial) => (
                  <ListGroup.Item
                    key={itemHistorial.id}
                    className={`d-flex justify-content-between align-items-center ${itemHistorial.subestado === 'Completado' ? 'list-group-item-success text-dark' : 'text-dark'}`}
                  >
                    Hist. Estado: {itemHistorial.subestado}<br />
                    Teléfono Responsable: {itemHistorial.telefonoResponsable || 'No especificado'}<br />
                    Unidad: {itemHistorial.unidad || 'No especificado'}<br />
                    Necesita Ayuda: {itemHistorial.necesitaAyuda || 'No especificado'}<br />
                    Notas: {itemHistorial.notas || 'No especificado'}<br />

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
    <Container style={{ maxWidth: '90%' }} className="mt-5">
      <NavBar handleSignOut={handleSignOut} />
      {mensaje && <div className="alert alert-info">{mensaje}</div>}
      {renderCardsEmergencias()}
    </Container>
  );
}

export default Operaciones;