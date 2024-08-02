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

const Form221 = () => {
  const [nombreIncidente, setNombreIncidente] = useState('');
  const [fechaPreparacion, setFechaPreparacion] = useState('');
  const [periodoOperacional, setPeriodoOperacional] = useState('');
  const [tiempoConclusion, setTiempoConclusion] = useState('');
  const [verificacionPlanificacion, setVerificacionPlanificacion] = useState('');
  const [verificacionOperaciones, setVerificacionOperaciones] = useState('');
  const [verificacionLogistica, setVerificacionLogistica] = useState('');
  const [verificacionAdministracion, setVerificacionAdministracion] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [preparadoPor, setPreparadoPor] = useState('');
  const [posicion, setPosicion] = useState('');
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
    const formRef = ref(db, 'formulariosci/221');
    
    const formData = {
      nombreIncidente,
      fechaPreparacion,
      periodoOperacional,
      tiempoConclusion,
      verificacionPlanificacion,
      verificacionOperaciones,
      verificacionLogistica,
      verificacionAdministracion,
      observaciones,
      preparadoPor,
      posicion,
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
    setFechaPreparacion('');
    setPeriodoOperacional('');
    setTiempoConclusion('');
    setVerificacionPlanificacion('');
    setVerificacionOperaciones('');
    setVerificacionLogistica('');
    setVerificacionAdministracion('');
    setObservaciones('');
    setPreparadoPor('');
    setPosicion('');
  };

  return (
    <div>
      <NavBar handleSignOut={handleSignOut} />
      <div className="container mt-5">
        <h2 className="form-title">SCI 221 - Verificación de Desmovilización</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="form-header">PRIMERA PARTE</div>
            <div className="form-group">
              <label htmlFor="nombreIncidente">Nombre del Incidente:</label>
              <input type="text" id="nombreIncidente" className="form-control" value={nombreIncidente} onChange={(e) => setNombreIncidente(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="fechaPreparacion">Fecha y Hora de Preparación:</label>
              <input type="datetime-local" id="fechaPreparacion" className="form-control" value={fechaPreparacion} onChange={(e) => setFechaPreparacion(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="periodoOperacional">Período Operacional:</label>
              <input type="text" id="periodoOperacional" className="form-control" value={periodoOperacional} onChange={(e) => setPeriodoOperacional(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="tiempoConclusion">Tiempo Estimado de Conclusión:</label>
              <input type="text" id="tiempoConclusion" className="form-control" value={tiempoConclusion} onChange={(e) => setTiempoConclusion(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="verificacionPlanificacion">Lista de Verificación de la Sección de Planificación:</label>
              <textarea id="verificacionPlanificacion" className="form-control" rows="3" value={verificacionPlanificacion} onChange={(e) => setVerificacionPlanificacion(e.target.value)}></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="verificacionOperaciones">Lista de Verificación de la Sección de Operaciones:</label>
              <textarea id="verificacionOperaciones" className="form-control" rows="3" value={verificacionOperaciones} onChange={(e) => setVerificacionOperaciones(e.target.value)}></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="verificacionLogistica">Lista de Verificación de la Sección de Logística:</label>
              <textarea id="verificacionLogistica" className="form-control" rows="3" value={verificacionLogistica} onChange={(e) => setVerificacionLogistica(e.target.value)}></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="verificacionAdministracion">Lista de Verificación de la Sección de Administración y Finanzas:</label>
              <textarea id="verificacionAdministracion" className="form-control" rows="3" value={verificacionAdministracion} onChange={(e) => setVerificacionAdministracion(e.target.value)}></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="observaciones">Observaciones:</label>
              <textarea id="observaciones" className="form-control" rows="3" value={observaciones} onChange={(e) => setObservaciones(e.target.value)}></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="preparadoPor">Preparado por:</label>
              <input type="text" id="preparadoPor" className="form-control" value={preparadoPor} onChange={(e) => setPreparadoPor(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="posicion">Posición:</label>
              <input type="text" id="posicion" className="form-control" value={posicion} onChange={(e) => setPosicion(e.target.value)} />
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

export default Form221;