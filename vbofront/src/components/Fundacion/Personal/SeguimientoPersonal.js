import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import './SeguimientoPersonal.css';
import NavBar from '../../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../firebase';

function SeguimientoPersonal() {
  const [ci, setCi] = useState('');
  const [personalData, setPersonalData] = useState(null);
  const [error, setError] = useState('');
  const [userUnit, setUserUnit] = useState('');
  const [showEstadoModal, setShowEstadoModal] = useState(false);
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [showDocumentacionModal, setShowDocumentacionModal] = useState(false);
  const [estado, setEstado] = useState('');
  const [permiso, setPermiso] = useState('');
  const [motivo, setMotivo] = useState(''); // Motivo siempre visible
  const [historial, setHistorial] = useState([]);
  const [documentacion, setDocumentacion] = useState({
    CI: false,
    Croquis: false,
    Compromiso: false
  });
  const navigate = useNavigate();

  useEffect(() => {
    const unidadAutenticada = localStorage.getItem('userUnit');
    if (unidadAutenticada) {
      setUserUnit(unidadAutenticada);
    }
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/signin');
      console.log('Sesión cerrada');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

  const handleSearch = () => {
    const db = getDatabase();
    const personalRef = ref(db, 'fundacion/personal');

    onValue(personalRef, (snapshot) => {
      const personalData = snapshot.val();
      const foundPersonal = personalData ? Object.values(personalData).find(personal => personal.ci === ci) : null;

      if (foundPersonal) {
        if (foundPersonal.unidad === userUnit) {
          setPersonalData(foundPersonal);
          setHistorial(foundPersonal.historial || []);
          setDocumentacion({
            CI: foundPersonal.documentacion?.CI || false,
            Croquis: foundPersonal.documentacion?.Croquis || false,
            Compromiso: foundPersonal.documentacion?.Compromiso || false,
          });
          setError('');
        } else {
          setPersonalData(null);
          setError('El voluntario no pertenece a tu unidad.');
        }
      } else {
        setPersonalData(null);
        setError('No se encontró un voluntario con ese carnet de identidad.');
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  const handleSaveEstado = () => {
    const db = getDatabase();
    if (personalData && personalData.ci) {
      // Crear nuevo historial con la fecha, estado, permiso (si aplica), y motivo
      const nuevoHistorial = {
        fecha: new Date().toISOString(),
        estado,
        permiso: estado === "Permiso" ? permiso : null, // Solo guardar permiso si el estado es "Permiso"
        motivo,  // Guardar motivo independientemente del estado
      };

      // Actualizar el historial y el estado en la base de datos
      update(ref(db, `fundacion/personal/${personalData.ci}`), {
        estado,
        historial: [...historial, nuevoHistorial],  // Agregar el nuevo historial al existente
      }).then(() => {
        setPersonalData((prev) => ({ ...prev, estado, historial: [...historial, nuevoHistorial] }));
        setShowEstadoModal(false);
      }).catch((error) => {
        console.error("Error updating estado:", error);
      });
    } else {
      console.error("No se pudo guardar el estado porque el ID es indefinido.");
    }
  };

  const handleSaveDocumentacion = () => {
    const db = getDatabase();
    if (personalData && personalData.ci) {
      update(ref(db, `fundacion/personal/${personalData.ci}`), {
        documentacion,
      }).then(() => {
        setPersonalData((prev) => ({ ...prev, documentacion }));
        setShowDocumentacionModal(false);
      }).catch((error) => {
        console.error("Error updating documentacion:", error);
      });
    } else {
      console.error("No se pudo guardar la documentación porque el ID es indefinido.");
    }
  };

  return (
    <div>
      <NavBar handleSignOut={handleSignOut} />
      <div className="seguimiento-personal-container">
        <div className="content-wrapper">
          <h2 className="text-center mb-4">Seguimiento de Personal</h2>
          <Form className="d-flex justify-content-center mb-4 search-form" onSubmit={handleSubmit}>
            <Form.Control
              type="text"
              placeholder="Buscar por carnet de identidad"
              className="mr-2 search-input"
              value={ci}
              onChange={(e) => setCi(e.target.value)}
            />
            <Button variant="primary" type="submit" className="search-button">
              Buscar
            </Button>
          </Form>

          {error && <p className="text-center text-danger error-message">{error}</p>}

          {personalData && (
            <>
              <Card className="personal-card mx-auto">
                <Card.Body className="d-flex align-items-center">
                  <div className="card-left">
                    <Card.Img
                      variant="top"
                      src="https://via.placeholder.com/150"
                      className="profile-image"
                    />
                    <div className="name-section">
                      <h4 className="name-text">{personalData.nombre} {personalData.apellidoPaterno} {personalData.apellidoMaterno}</h4>
                      <h6 className="role-text">Voluntario</h6>
                    </div>
                  </div>
                  <div className="card-right">
                    <Card.Text className="card-text">
                      <strong>CI:</strong> {personalData.ci} <br />
                      <strong>Tipo de Sangre:</strong> {personalData.tipoSangre || 'N/A'} <br />
                      <strong>E-mail:</strong> {personalData.correo} <br />
                      <strong>Teléfono:</strong> {personalData.telefono} <br />
                      <strong>Dirección:</strong> {personalData.direccion} <br />
                      <strong>Ciudad:</strong> {personalData.ciudad} <br />
                      <strong>Unidad:</strong> {personalData.unidad} <br />
                      <strong>Estado:</strong> {personalData.estado || 'N/A'}
                    </Card.Text>
                  </div>
                </Card.Body>
              </Card>

              <div className="mt-4 d-flex justify-content-center">
                <Button variant="warning" className="mr-2 mx-3" onClick={() => setShowEstadoModal(true)}>Gestión Estado</Button>
                <Button variant="info" className="mr-2 mx-3" onClick={() => setShowHistorialModal(true)}>Ver Historial</Button>
                <Button variant="warning" className="mx-3" onClick={() => setShowDocumentacionModal(true)}>Gestión Documentación</Button>
              </div>
            </>
          )}

          {/* Modal para Gestión de Estado */}
          <Modal show={showEstadoModal} onHide={() => setShowEstadoModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Gestión de Estado</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group controlId="formEstado">
                <Form.Label>Selecciona el Estado:</Form.Label>
                <Form.Control as="select" value={estado} onChange={(e) => setEstado(e.target.value)}>
                  <option value="">Seleccione...</option>
                  <option value="Activo">Activo</option>
                  <option value="Pasivo">Pasivo</option>
                  <option value="Cooperador">Cooperador</option>
                  <option value="Baja">Baja</option>
                  <option value="Suspendido">Suspendido</option>
                  <option value="Permiso">Permiso</option>
                </Form.Control>
              </Form.Group>

              {estado === "Permiso" && (
                <Form.Group controlId="formPermiso" className="mt-3">
                  <Form.Label>Selecciona el Permiso:</Form.Label>
                  <Form.Control as="select" value={permiso} onChange={(e) => setPermiso(e.target.value)}>
                    <option value="">Seleccione...</option>
                    <option value="Estudio">Estudio</option>
                    <option value="Trabajo">Trabajo</option>
                    <option value="Familiar">Familiar</option>
                    <option value="Otros">Otros</option>
                  </Form.Control>
                </Form.Group>
              )}

              <Form.Group controlId="formMotivo" className="mt-3">
                <Form.Label>Motivo:</Form.Label>
                <Form.Control
                  type="text"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Especifica el motivo"
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowEstadoModal(false)}>Cancelar</Button>
              <Button variant="primary" onClick={handleSaveEstado}>Guardar</Button>
            </Modal.Footer>
          </Modal>

          {/* Modal para Ver Historial */}
          <Modal show={showHistorialModal} onHide={() => setShowHistorialModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Historial</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {historial.length > 0 ? (
                <ul>
                  {historial.map((entry, index) => (
                    <li key={index}>{`${entry.fecha}: ${entry.estado || 'Sin estado'} ${entry.permiso ? '- Permiso: ' + entry.permiso : ''} ${entry.motivo ? '- Motivo: ' + entry.motivo : ''}`}</li>
                  ))}
                </ul>
              ) : (
                <p>No tiene historial.</p>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowHistorialModal(false)}>Cerrar</Button>
            </Modal.Footer>
          </Modal>

          {/* Modal para Gestión de Documentación */}
          <Modal show={showDocumentacionModal} onHide={() => setShowDocumentacionModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Gestión de Documentación</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Check
                type="checkbox"
                label="CI"
                checked={documentacion.CI}
                onChange={(e) => setDocumentacion({ ...documentacion, CI: e.target.checked })}
              />
              <Form.Check
                type="checkbox"
                label="Croquis"
                checked={documentacion.Croquis}
                onChange={(e) => setDocumentacion({ ...documentacion, Croquis: e.target.checked })}
              />
              <Form.Check
                type="checkbox"
                label="Compromiso"
                checked={documentacion.Compromiso}
                onChange={(e) => setDocumentacion({ ...documentacion, Compromiso: e.target.checked })}
              />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowDocumentacionModal(false)}>Cancelar</Button>
              <Button variant="primary" onClick={handleSaveDocumentacion}>Guardar</Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
}

export default SeguimientoPersonal;