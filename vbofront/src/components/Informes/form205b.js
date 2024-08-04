import React, { useState } from 'react';
import { getDatabase, ref, push } from 'firebase/database';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import NavBar from '../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import './form205.css'; // Assuming this is where the styling is coming from

const Form205b = () => {
  const [registroMedios, setRegistroMedios] = useState('');
  const [logComunicaciones, setLogComunicaciones] = useState('');
  const [faqs, setFaqs] = useState('');
  const [fechaHora, setFechaHora] = useState('');
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
    const formRef = ref(db, 'formulariosci/205b');

    const formData = {
      registroMedios,
      logComunicaciones,
      faqs,
      fechaHora,
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
    setRegistroMedios('');
    setLogComunicaciones('');
    setFaqs('');
    setFechaHora('');
  };

  return (
    <div>
      <NavBar handleSignOut={handleSignOut} />
      <div className="container mt-5">
        <h2 className="form-title">SCI 205-B - Comunicación Detallada</h2>
        <p className="form-subtitle">
          Detalles adicionales sobre comunicación y medios.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="form-header">PRIMERA PARTE</div>
            <div className="form-group">
              <label htmlFor="fechaHora">Fecha y Hora:</label>
              <input
                type="datetime-local"
                id="fechaHora"
                className="form-control"
                value={fechaHora}
                onChange={(e) => setFechaHora(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="registroMedios">Registro de Medios:</label>
              <textarea
                id="registroMedios"
                className="form-control"
                rows="3"
                value={registroMedios}
                onChange={(e) => setRegistroMedios(e.target.value)}
                required
              ></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="logComunicaciones">Log de Comunicaciones:</label>
              <textarea
                id="logComunicaciones"
                className="form-control"
                rows="3"
                value={logComunicaciones}
                onChange={(e) => setLogComunicaciones(e.target.value)}
                required
              ></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="faqs">Preguntas Frecuentes (FAQs):</label>
              <textarea
                id="faqs"
                className="form-control"
                rows="3"
                value={faqs}
                onChange={(e) => setFaqs(e.target.value)}
                required
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

export default Form205b;
