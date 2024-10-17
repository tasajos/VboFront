import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { signOut, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import './Opvoluntario.css';
import NavBar from '../../NavBar/navbar';
import { auth } from '../../../firebase';

function Opvoluntario() {
  const [operaciones, setOperaciones] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [ciUsuario, setCiUsuario] = useState(null); // Guardar el CI del usuario
  const [showModal, setShowModal] = useState(true); // Modal para pedir la contraseña
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // Función para cerrar sesión
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/signin'); // Redirigir al iniciar sesión
      console.log('Sesión cerrada');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

  // Manejo del envío del formulario de reautenticación
  const handleReauthenticate = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (user) {
      const credential = EmailAuthProvider.credential(user.email, password);
      try {
        await reauthenticateWithCredential(user, credential);
        setUsuario(user);
        setShowModal(false); // Cerrar el modal al autenticar correctamente
        cargarCiUsuario(user); // Cargar CI del usuario antes de buscar las operaciones
      } catch (error) {
        setErrorMessage('Error de autenticación. Por favor, verifica tu contraseña.');
      }
    }
  };

  // Cargar el CI del usuario autenticado
  const cargarCiUsuario = (user) => {
    const db = getDatabase();
    const personalRef = ref(db, `fundacion/personal`);

    // Buscamos en la base de datos por el correo electrónico o UID del usuario para obtener su CI
    onValue(personalRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usuarioData = Object.values(data).find((personal) => personal.correo === user.email);
        if (usuarioData) {
          setCiUsuario(usuarioData.ci); // Guardamos el CI del usuario encontrado
          cargarOperaciones(usuarioData.ci); // Cargamos las operaciones basadas en el CI
        }
      }
    });
  };

  // Cargar operaciones del usuario autenticado por CI
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
      setShowModal(true); // Mostrar modal para reautenticar
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
              <Card key={index} className="mb-3">
                <Card.Body>
                  <Card.Title>{operacion.operacion}</Card.Title>
                  <Card.Text>
                    <strong>Fecha:</strong> {operacion.fechaOperacion} <br />
                    <strong>Estado:</strong> {operacion.estado} <br />
                    <strong>Autorizado por:</strong> {operacion.autorizadoPor} <br />
                    <strong>Observaciones:</strong> {operacion.observaciones}
                  </Card.Text>
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
