import React, { useState, useEffect } from 'react';
import { getDatabase, ref, push } from 'firebase/database';
import './RegistrarEquipo.css'; 
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import NavBar from '../../../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../../firebase';
import ClasificacionCodigo from '../AsignacionCodigo/ClasificacionCodigo'; 

function RegistrarEquipo() {
  const [nombreEquipo, setNombreEquipo] = useState('');
  const [estado, setEstado] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [unidadUsuario, setUnidadUsuario] = useState(localStorage.getItem('userUnit') || '');
  const [codigoData, setCodigoData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [isFormComplete, setIsFormComplete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica si todos los campos están completos y hay un código generado para habilitar el botón
    setIsFormComplete(nombreEquipo && estado && descripcion && codigoData);
  }, [nombreEquipo, estado, descripcion, codigoData]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/signin');
      console.log('Sesión cerrada');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

  const handleCodigoAsignado = (data) => {
    setCodigoData(data); // Almacena el objeto completo con los datos del código
  };

  const handleSaveEquipo = () => {
    if (isFormComplete) {
      const db = getDatabase();
      const equipoRef = ref(db, `fundacion/equipos/${unidadUsuario}/${codigoData.codigo}`);

      push(equipoRef, {
        nombre: nombreEquipo,
        estado: estado,
        descripcion: descripcion,
        codigo: codigoData.codigo,
        tipoEquipo: codigoData.tipoEquipo,
        fechaAdquisicion: codigoData.fechaAdquisicion,
        unidad: unidadUsuario,
      }).then(() => {
        setModalTitle('Registro Exitoso');
        setModalMessage('El equipo ha sido registrado exitosamente.');
        setShowModal(true);
        // Limpia los campos del formulario
        setNombreEquipo('');
        setEstado('');
        setDescripcion('');
        setCodigoData(null);
      }).catch((error) => {
        setModalTitle('Error al Registrar');
        setModalMessage('Error al registrar el equipo: ' + error.message);
        setShowModal(true);
      });
    } else {
      setModalTitle('Campos Incompletos');
      setModalMessage('Por favor, complete todos los campos.');
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <NavBar handleSignOut={handleSignOut} />

      <div className="registrar-equipo-container">
        <h2 className="registrar-equipo-header">Registrar Nuevo Equipo</h2>
        <div className="registrar-equipo-form">
          <div className="form-group">
            <label htmlFor="nombreEquipo">Nombre del Equipo:</label>
            <input
              type="text"
              id="nombreEquipo"
              className="form-control"
              value={nombreEquipo}
              onChange={(e) => setNombreEquipo(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="estado">Estado:</label>
            <select
              id="estado"
              className="form-control"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              required
            >
              <option value="">Seleccione un estado</option>
              <option value="Nuevo">Nuevo</option>
              <option value="Usado">Usado</option>
              <option value="Dañado">Dañado</option>
              <option value="Fuera de Servicio">Fuera de Servicio</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="descripcion">Descripción:</label>
            <textarea
              id="descripcion"
              className="form-control"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
            />
          </div>

          {/* Componente de Asignación de Código */}
          <ClasificacionCodigo onCodigoAsignado={handleCodigoAsignado} />

          <button
            id="guardarEquipoBtn"
            className="btn btn-primary"
            onClick={handleSaveEquipo}
            disabled={!isFormComplete}
          >
            Guardar Equipo
          </button>
        </div>
      </div>

      <Modal show={showModal} onHide={handleCloseModal} className="modal-centered" centered>
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCloseModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default RegistrarEquipo;
