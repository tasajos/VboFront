import React, { useState } from 'react';
import { getDatabase, ref, push } from 'firebase/database';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import NavBar from '../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import './form204.css';

const Form204 = () => {
  const [nombreIncidente, setNombreIncidente] = useState('');
  const [divisionGrupo, setDivisionGrupo] = useState('');
  const [recursosAsignados, setRecursosAsignados] = useState('');
  const [tareas, setTareas] = useState('');
  const [instruccionesEspeciales, setInstruccionesEspeciales] = useState('');
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
    const formRef = ref(db, 'formulariosci/204');

    const formData = {
      nombreIncidente,
      divisionGrupo,
      recursosAsignados,
      tareas,
      instruccionesEspeciales,
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
    setDivisionGrupo('');
    setRecursosAsignados('');
    setTareas('');
    setInstruccionesEspeciales('');
  };

  return (
    <div>
      <NavBar handleSignOut={handleSignOut} />
      <div className="container mt-5">
        <h2 className="form-title">SCI 204 - Asignaciones Tácticas</h2>
        <p className="form-subtitle">
          Oficial de Seguridad / Jefe de Operaciones
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
              <label htmlFor="divisionGrupo">División / Grupo:</label>
              <input
                type="text"
                id="divisionGrupo"
                className="form-control"
                value={divisionGrupo}
                onChange={(e) => setDivisionGrupo(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="recursosAsignados">Recursos Asignados:</label>
              <textarea
                id="recursosAsignados"
                className="form-control"
                rows="3"
                value={recursosAsignados}
                onChange={(e) => setRecursosAsignados(e.target.value)}
                required
              ></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="tareas">Tareas:</label>
              <textarea
                id="tareas"
                className="form-control"
                rows="3"
                value={tareas}
                onChange={(e) => setTareas(e.target.value)}
                required
              ></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="instruccionesEspeciales">Instrucciones Especiales:</label>
              <textarea
                id="instruccionesEspeciales"
                className="form-control"
                rows="3"
                value={instruccionesEspeciales}
                onChange={(e) => setInstruccionesEspeciales(e.target.value)}
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

export default Form204;
