import React, { useState } from 'react';
import { getDatabase, ref, push } from 'firebase/database';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import NavBar from '../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import './form201.css';

const Form201 = () => {
  const [nombreIncidente, setnombreIncidente] = useState('');
  const [fechaHora, setfechaHora] = useState('');
  const [location, setLocation] = useState('');
  const [commandUnit, setCommandUnit] = useState('');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [actionsTaken, setActionsTaken] = useState('');
  const [incidentObjectives, setIncidentObjectives] = useState('');
  const [resourcesAssigned, setResourcesAssigned] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
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
    const formRef = ref(db, 'formulariosci/201');
    
    const formData = {
      nombreIncidente,
      fechaHora,
      location,
      commandUnit,
      incidentDescription,
      actionsTaken,
      incidentObjectives,
      resourcesAssigned,
      additionalNotes,
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
    setnombreIncidente('');
    setfechaHora('');
    setLocation('');
    setCommandUnit('');
    setIncidentDescription('');
    setActionsTaken('');
    setIncidentObjectives('');
    setResourcesAssigned('');
    setAdditionalNotes('');
  };

  return (
    <div>
      <NavBar handleSignOut={handleSignOut} />
      <div className="container mt-5">
        <h2 className="form-title">SCI 201 - Resumen de la Situación del Incidente</h2>
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
              <input type="text" id="nombreIncidente" className="form-control" value={nombreIncidente} onChange={(e) => setnombreIncidente(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="fechaHora">Fecha y Hora:</label>
              <input type="datetime-local" id="fechaHora" className="form-control" value={fechaHora} onChange={(e) => setfechaHora(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="location">Ubicación:</label>
              <input type="text" id="location" className="form-control" value={location} onChange={(e) => setLocation(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="commandUnit">Mando del Incidente:</label>
              <input type="text" id="commandUnit" className="form-control" value={commandUnit} onChange={(e) => setCommandUnit(e.target.value)} required />
            </div>
          </div>
          <div className="form-section">
            <div className="form-header">SEGUNDA PARTE</div>
            <div className="form-group">
              <label htmlFor="incidentDescription">Descripción del Incidente:</label>
              <textarea id="incidentDescription" className="form-control" rows="3" value={incidentDescription} onChange={(e) => setIncidentDescription(e.target.value)} required></textarea>
            </div>
          </div>
          <div className="form-section">
            <div className="form-header">TERCERA PARTE</div>
            <div className="form-group">
              <label htmlFor="actionsTaken">Acciones Tomadas:</label>
              <textarea id="actionsTaken" className="form-control" rows="3" value={actionsTaken} onChange={(e) => setActionsTaken(e.target.value)} required></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="incidentObjectives">Objetivos del Incidente:</label>
              <textarea id="incidentObjectives" className="form-control" rows="3" value={incidentObjectives} onChange={(e) => setIncidentObjectives(e.target.value)} required></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="resourcesAssigned">Recursos Asignados:</label>
              <textarea id="resourcesAssigned" className="form-control" rows="3" value={resourcesAssigned} onChange={(e) => setResourcesAssigned(e.target.value)} required></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="additionalNotes">Notas Adicionales:</label>
              <textarea id="additionalNotes" className="form-control" rows="3" value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)}></textarea>
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

export default Form201;