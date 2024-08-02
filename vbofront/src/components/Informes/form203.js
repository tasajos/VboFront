import React, { useState } from 'react';
import { getDatabase, ref, push } from 'firebase/database';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import NavBar from '../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import './form203.css';

const Form203 = () => {
  const [nombreIncidente, setNombreIncidente] = useState('');
  const [fechaHora, setFechaHora] = useState('');
  const [comandanteIncidente, setComandanteIncidente] = useState('');
  const [roles, setRoles] = useState({
    OficialSeguridad: { nombre: '', contacto: '' },
    OficialEnlace: { nombre: '', contacto: '' },
    OficialInformacion: { nombre: '', contacto: '' },
    JefeOperaciones: { nombre: '', contacto: '' },
    JefePlanificacion: { nombre: '', contacto: '' },
    JefeLogistica: { nombre: '', contacto: '' },
    JefeFinanzas: { nombre: '', contacto: '' },
  });
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

  const handleChange = (roleKey, field, value) => {
    setRoles((prevRoles) => ({
      ...prevRoles,
      [roleKey]: {
        ...prevRoles[roleKey],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const db = getDatabase();
    const formRef = ref(db, 'formulariosci/203');

    const formData = {
      nombreIncidente,
      fechaHora,
      comandanteIncidente,
      roles,
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
    setComandanteIncidente('');
    setRoles({
      OficialSeguridad: { nombre: '', contacto: '' },
      OficialEnlace: { nombre: '', contacto: '' },
      OficialInformacion: { nombre: '', contacto: '' },
      JefeOperaciones: { nombre: '', contacto: '' },
      JefePlanificacion: { nombre: '', contacto: '' },
      JefeLogistica: { nombre: '', contacto: '' },
      JefeFinanzas: { nombre: '', contacto: '' },
    });
  };

  return (
    <div>
      <NavBar handleSignOut={handleSignOut} />
      <div className="container mt-5">
        <h2 className="form-title">SCI 203 - Organización del Incidente</h2>
        <p className="form-subtitle">
          - Detalla la estructura organizativa del incidente.
          <br />
          - Incluye información sobre el Comandante del Incidente, el personal clave y sus roles.
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
            <div className="form-group">
              <label htmlFor="comandanteIncidente">Comandante del Incidente:</label>
              <input type="text" id="comandanteIncidente" className="form-control" value={comandanteIncidente} onChange={(e) => setComandanteIncidente(e.target.value)} required />
            </div>
          </div>
          <div className="form-section">
            <div className="form-header">SEGUNDA PARTE</div>
            <div className="form-group">
              <label>Personal Clave y Roles:</label>
            </div>
            {Object.entries(roles).map(([roleKey, role]) => (
              <div className="form-group" key={roleKey}>
                <label>{roleKey.split(/(?=[A-Z])/).join(' ')}:</label>
                <input
                  type="text"
                  placeholder="Nombre"
                  value={role.nombre}
                  onChange={(e) => handleChange(roleKey, 'nombre', e.target.value)}
                  className="form-control"
                  required
                />
                <input
                  type="text"
                  placeholder="Contacto"
                  value={role.contacto}
                  onChange={(e) => handleChange(roleKey, 'contacto', e.target.value)}
                  className="form-control"
                  required
                />
              </div>
            ))}
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

export default Form203;
