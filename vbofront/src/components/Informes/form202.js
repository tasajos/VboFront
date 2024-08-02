import React, { useState } from 'react';
import { getDatabase, ref, push } from 'firebase/database';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import NavBar from '../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import './form202.css';

const Form202 = () => {
  const [nombreIncidente, setNombreIncidente] = useState('');
  const [fechaHora, setFechaHora] = useState('');
  const [objetivosIncidente, setObjetivosIncidente] = useState('');
  const [prioridades, setPrioridades] = useState('');
  const [directrices, setDirectrices] = useState('');
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
    const formRef = ref(db, 'formulariosci/202');
    
    const formData = {
      nombreIncidente,
      fechaHora,
      objetivosIncidente,
      prioridades,
      directrices,
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
    setObjetivosIncidente('');
    setPrioridades('');
    setDirectrices('');
  };

  return (
    <div>
      <NavBar handleSignOut={handleSignOut} />
      <div className="container mt-5">
        <h2 className="form-title">SCI 202 - Objetivos del Incidente</h2>
        <p className="form-subtitle">
          - Se utiliza para registrar y comunicar la información inicial sobre un incidente.
          <br />
          - Incluye detalles como la descripción del incidente, acciones tomadas, objetivos, recursos asignados, y el mando del incidente.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="form-header">PRIMERA PARTE</div>
            <div className="form-group">
              <label htmlFor="nombreIncidente">Nombre del Incidente:</label>
              <input type="text" id="nombreIncidente" className="form-control" value={nombreIncidente} onChange={(e) => setNombreIncidente(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="fechaHora">Fecha y Hora:</label>
              <input type="datetime-local" id="fechaHora" className="form-control" value={fechaHora} onChange={(e) => setFechaHora(e.target.value)} required />
            </div>
          </div>
          <div className="form-section">
            <div className="form-header">SEGUNDA PARTE</div>
            <div className="form-group">
              <label htmlFor="objetivosIncidente">Objetivos del Incidente:</label>
              <textarea id="objetivosIncidente" className="form-control" rows="3" value={objetivosIncidente} onChange={(e) => setObjetivosIncidente(e.target.value)} required></textarea>
            </div>
          </div>
          <div className="form-section">
            <div className="form-header">TERCERA PARTE</div>
            <div className="form-group">
              <label htmlFor="prioridades">Prioridades:</label>
              <textarea id="prioridades" className="form-control" rows="3" value={prioridades} onChange={(e) => setPrioridades(e.target.value)} required></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="directrices">Directrices:</label>
              <textarea id="directrices" className="form-control" rows="3" value={directrices} onChange={(e) => setDirectrices(e.target.value)} required></textarea>
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-100 mt-4">
            {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : "Registrar"}
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

export default Form202;
