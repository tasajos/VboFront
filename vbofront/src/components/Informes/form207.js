import React, { useState } from 'react';
import { getDatabase, ref, push } from 'firebase/database';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import NavBar from '../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import './form205.css'; // Use this for custom styling

const Form207 = () => {
  const [nombreVictima, setNombreVictima] = useState('');
  const [edadVictima, setEdadVictima] = useState('');
  const [generoVictima, setGeneroVictima] = useState('');
  const [contactoEmergencia, setContactoEmergencia] = useState('');
  const [estadoVictima, setEstadoVictima] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/signin');
      console.log('Sesión cerrada');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const db = getDatabase();
    const formRef = ref(db, 'formulariosci/207');

    const formData = {
      nombreVictima,
      edadVictima,
      generoVictima,
      contactoEmergencia,
      estadoVictima,
      observaciones,
    };

    try {
      await push(formRef, formData);
      setShowModal(true);
      clearFields();
    } catch (error) {
      console.error('Error al registrar el formulario', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFields = () => {
    setNombreVictima('');
    setEdadVictima('');
    setGeneroVictima('');
    setContactoEmergencia('');
    setEstadoVictima('');
    setObservaciones('');
  };

  return (
    <div>
      <NavBar handleSignOut={handleSignOut} />
      <div className="container mt-5">
        <h2 className="form-title">SCI 207 - Registro de Víctimas</h2>
        <p className="form-subtitle">
          - Detalla información sobre las víctimas del incidente.
          <br />
          - Incluye detalles como nombre, edad, género, contacto de emergencia, estado y observaciones.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="form-header">Información de la Víctima</div>
            <div className="form-group">
              <label htmlFor="nombreVictima">Nombre de la Víctima:</label>
              <input
                type="text"
                id="nombreVictima"
                className="form-control"
                value={nombreVictima}
                onChange={(e) => setNombreVictima(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="edadVictima">Edad:</label>
              <input
                type="number"
                id="edadVictima"
                className="form-control"
                value={edadVictima}
                onChange={(e) => setEdadVictima(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="generoVictima">Género:</label>
              <select
                id="generoVictima"
                className="form-control"
                value={generoVictima}
                onChange={(e) => setGeneroVictima(e.target.value)}
                required
              >
                <option value="">Seleccione</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="contactoEmergencia">Contacto de Emergencia:</label>
              <input
                type="text"
                id="contactoEmergencia"
                className="form-control"
                value={contactoEmergencia}
                onChange={(e) => setContactoEmergencia(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="estadoVictima">Estado de la Víctima:</label>
              <select
                id="estadoVictima"
                className="form-control"
                value={estadoVictima}
                onChange={(e) => setEstadoVictima(e.target.value)}
                required
              >
                <option value="">Seleccione</option>
                <option value="Rojo">Rojo</option>
                <option value="Amarillo">Amarillo</option>
                <option value="Verde">Verde</option>
                <option value="Negro">Negro</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="observaciones">Observaciones:</label>
              <textarea
                id="observaciones"
                className="form-control"
                rows="3"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              ></textarea>
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-100 mt-4">
            {loading ? (
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
            ) : (
              'Registrar'
            )}
          </button>
        </form>
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Registro Exitoso</Modal.Title>
          </Modal.Header>
          <Modal.Body>El formulario ha sido registrado con éxito en el sistema.</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default Form207;
