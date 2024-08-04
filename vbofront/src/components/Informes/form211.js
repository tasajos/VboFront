import React, { useState } from 'react';
import { getDatabase, ref, push } from 'firebase/database';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import NavBar from '../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import './form211.css'; // Use this for custom styling

const Form211 = () => {
  const [nombreIncidente, setNombreIncidente] = useState('');
  const [fechaHora, setFechaHora] = useState('');
  const [registroPersonal, setRegistroPersonal] = useState([
    { nro: 1, nombre: '', institucion: '', horaEntrada: '', horaSalida: '' },
  ]);
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

  const handleChange = (index, field, value) => {
    const newRegistroPersonal = [...registroPersonal];
    newRegistroPersonal[index][field] = value;
    setRegistroPersonal(newRegistroPersonal);
  };

  const addNewEntry = () => {
    setRegistroPersonal([
      ...registroPersonal,
      { nro: registroPersonal.length + 1, nombre: '', institucion: '', horaEntrada: '', horaSalida: '' },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const db = getDatabase();
    const formRef = ref(db, 'formulariosci/211');

    const formData = {
      nombreIncidente,
      fechaHora,
      registroPersonal,
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
    setRegistroPersonal([{ nro: 1, nombre: '', institucion: '', horaEntrada: '', horaSalida: '' }]);
  };

  return (
    <div>
      <NavBar handleSignOut={handleSignOut} />
      <div className="container mt-5 incident-report-container">
        <h2 className="form-title">SCI 211 - Registro de Entrada y Salida de Personal</h2>
        <p className="form-subtitle">
          - Se utiliza para mantener un registro de todas las personas que entran y salen del área del incidente.
          <br />
          - Incluye información como el nombre del personal, la institución, la hora de entrada y salida, y el motivo de la entrada/salida.
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
          </div>
          <div className="form-section">
            <div className="form-header">SEGUNDA PARTE</div>
            <div className="form-group">
              <label>Registro de Personal:</label>
              <div className="entries-container">
                {registroPersonal.map((entry, index) => (
                  <div key={index} className="entry-group mb-4">
                    <div className="form-group">
                      <label htmlFor={`nombre-${index}`}>Nombre:</label>
                      <input
                        type="text"
                        id={`nombre-${index}`}
                        className="form-control"
                        value={entry.nombre}
                        onChange={(e) => handleChange(index, 'nombre', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor={`institucion-${index}`}>Institución:</label>
                      <input
                        type="text"
                        id={`institucion-${index}`}
                        className="form-control"
                        value={entry.institucion}
                        onChange={(e) => handleChange(index, 'institucion', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor={`horaEntrada-${index}`}>Hora de Entrada:</label>
                      <input
                        type="time"
                        id={`horaEntrada-${index}`}
                        className="form-control"
                        value={entry.horaEntrada}
                        onChange={(e) => handleChange(index, 'horaEntrada', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor={`horaSalida-${index}`}>Hora de Salida:</label>
                      <input
                        type="time"
                        id={`horaSalida-${index}`}
                        className="form-control"
                        value={entry.horaSalida}
                        onChange={(e) => handleChange(index, 'horaSalida', e.target.value)}
                        required
                      />
                    </div>
                    <hr />
                  </div>
                ))}
              </div>
              <button type="button" className="btn btn-secondary mt-2" onClick={addNewEntry}>
                Añadir Entrada
              </button>
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

export default Form211;
