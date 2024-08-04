import React, { useState } from 'react';
import { getDatabase, ref, push } from 'firebase/database';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import NavBar from '../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import './form205.css';

const Form205 = () => {
  const [nombreIncidente, setNombreIncidente] = useState('');
  const [fechaHora, setFechaHora] = useState('');
  const [frecuenciasRadio, setFrecuenciasRadio] = useState('');
  const [canalesComunicacion, setCanalesComunicacion] = useState('');
  const [puntoContacto, setPuntoContacto] = useState('');
  const [notasAdicionales, setNotasAdicionales] = useState('');
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
    const formRef = ref(db, 'formulariosci/205');

    const formData = {
      nombreIncidente,
      fechaHora,
      frecuenciasRadio,
      canalesComunicacion,
      puntoContacto,
      notasAdicionales,
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
    setNombreIncidente('');
    setFechaHora('');
    setFrecuenciasRadio('');
    setCanalesComunicacion('');
    setPuntoContacto('');
    setNotasAdicionales('');
  };

  return (
    <div>
      <NavBar handleSignOut={handleSignOut} />
      <div className="container mt-5">
        <h2 className="form-title">SCI 205 - Plan de Comunicaciones</h2>
        <p className="form-subtitle">
        Oficial de Información Pública / Oficial de Enlaces
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="form-header">PRIMERA PARTE</div>
            <div className="form-group">
              <label htmlFor="nombreIncidente">Nombre del Incidente:</label>
              <input
                type="text"
                id="nombreIncidente"
                className="form-control"
                value={nombreIncidente}
                onChange={(e) => setNombreIncidente(e.target.value)}
                required
              />
            </div>
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
              <label htmlFor="frecuenciasRadio">Frecuencias de Radio:</label>
              <input
                type="text"
                id="frecuenciasRadio"
                className="form-control"
                value={frecuenciasRadio}
                onChange={(e) => setFrecuenciasRadio(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="canalesComunicacion">Canales de Comunicación:</label>
              <textarea
                id="canalesComunicacion"
                className="form-control"
                rows="3"
                value={canalesComunicacion}
                onChange={(e) => setCanalesComunicacion(e.target.value)}
                required
              ></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="puntoContacto">Punto de Contacto:</label>
              <textarea
                id="puntoContacto"
                className="form-control"
                rows="3"
                value={puntoContacto}
                onChange={(e) => setPuntoContacto(e.target.value)}
                required
              ></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="notasAdicionales">Notas Adicionales:</label>
              <textarea
                id="notasAdicionales"
                className="form-control"
                rows="3"
                value={notasAdicionales}
                onChange={(e) => setNotasAdicionales(e.target.value)}
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

export default Form205;
