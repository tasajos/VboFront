import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { signOut, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { FaThumbsUp, FaComment, FaShare } from 'react-icons/fa'; // Añadir iconos
import { format } from 'date-fns'; // Importamos la función de formateo de fecha
import './Opvoluntario.css';
import NavBar from '../../NavBar/navbar';
import { auth } from '../../../firebase';

function Opvoluntario() {
  const [operaciones, setOperaciones] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [ciUsuario, setCiUsuario] = useState(null);
  const [showModal, setShowModal] = useState(true);
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/signin');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

  const handleReauthenticate = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (user) {
      const credential = EmailAuthProvider.credential(user.email, password);
      try {
        await reauthenticateWithCredential(user, credential);
        setUsuario(user);
        setShowModal(false);
        cargarCiUsuario(user);
      } catch (error) {
        setErrorMessage('Error de autenticación. Por favor, verifica tu contraseña.');
      }
    }
  };

  const cargarCiUsuario = (user) => {
    const db = getDatabase();
    const personalRef = ref(db, `fundacion/personal`);

    onValue(personalRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usuarioData = Object.values(data).find((personal) => personal.correo === user.email);
        if (usuarioData) {
          setCiUsuario(usuarioData.ci);
          cargarOperaciones(usuarioData.ci);
        }
      }
    });
  };

  const cargarOperaciones = (ci) => {
    const db = getDatabase();
    const operacionesRef = ref(db, `fundacion/personal/${ci}/operaciones`);

    onValue(operacionesRef, (snapshot) => {
      const data = snapshot.val();
      const operacionesArray = data ? Object.values(data) : [];
      setOperaciones(operacionesArray);
    });
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUsuario(user);
      setShowModal(true);
    }
  }, []);

  return (
    <div>
      <NavBar handleSignOut={handleSignOut} />
      <div className="opvoluntario-container">
        <h2 className="opvoluntario-header">Operaciones del Voluntario</h2>
        {operaciones.length > 0 ? (
          <div className="opvoluntario-cards">
            {operaciones.map((operacion, index) => (
              <Card key={index} className="opvoluntario-card mb-4 shadow-sm">
                <Card.Body>
                  <Card.Title className="opvoluntario-card-title">{operacion.operacion}</Card.Title>
                  {/* Formateamos la fecha para que solo muestre DD/MM/AAAA */}
                  <Card.Subtitle className="mb-2 text-muted">
                    {format(new Date(operacion.fechaOperacion), 'dd/MM/yyyy')}
                  </Card.Subtitle>
                  <Card.Text>
                    <strong>Estado:</strong> {operacion.estado} <br />
                    <strong>Autorizado por:</strong> {operacion.autorizadoPor} <br />
                    <strong>Observaciones:</strong> {operacion.observaciones}
                  </Card.Text>
                  <div className="opvoluntario-card-actions">
                    <Button variant="link">
                      <FaThumbsUp /> Me gusta
                    </Button>
                    <Button variant="link">
                      <FaComment /> Comentar
                    </Button>
                    <Button variant="link">
                      <FaShare /> Compartir
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        ) : (
          <p>No se encontraron operaciones para el usuario.</p>
        )}
        <Button variant="primary" onClick={handleSignOut} className="mt-3">Cerrar Sesión</Button>

        {/* Modal para solicitar reautenticación */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Reautenticación requerida</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleReauthenticate}>
              <Form.Group controlId="formBasicPassword">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Ingrese su contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Group>
              {errorMessage && <p className="text-danger mt-2">{errorMessage}</p>}
              <Button variant="primary" type="submit" className="mt-3">
                Reautenticar
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}

export default Opvoluntario;
