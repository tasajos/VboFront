import React, { useState, useEffect } from 'react';
import { getDatabase, ref, push, get, update } from 'firebase/database';
import './ClasificacionCodigo.css'; 
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import NavBar from '../../../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../../firebase';

function ClasificacionCodigo() {
  const [tipoEquipo, setTipoEquipo] = useState('');
  const [fechaAdquisicion, setFechaAdquisicion] = useState('');
  const [unidadUsuario, setUnidadUsuario] = useState(localStorage.getItem('userUnit') || '');
  const [codigoGenerado, setCodigoGenerado] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showNewTypeModal, setShowNewTypeModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [newType, setNewType] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [tiposEquipos, setTiposEquipos] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const db = getDatabase();
    const tiposRef = ref(db, 'fundacion/tiposEquipos');
    get(tiposRef).then((snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTiposEquipos(data);
      }
    }).catch((error) => {
      console.error('Error al recuperar tipos de equipos:', error);
    });
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/signin');
      console.log('Sesión cerrada');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

  const handleGenerateCode = () => {
    if (tipoEquipo && fechaAdquisicion && unidadUsuario) {
      const fecha = new Date(fechaAdquisicion);
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const day = String(fecha.getDate()).padStart(2, '0');

      const db = getDatabase();
      const equipoRef = ref(db, `fundacion/equipos/${unidadUsuario}/${tipoEquipo}`);
      get(equipoRef).then((snapshot) => {
        const equipoData = snapshot.val();
        const count = equipoData ? Object.keys(equipoData).length + 1 : 1;
        const correlativo = String(count).padStart(2, '0');
        const codigo = `${tiposEquipos[tipoEquipo].prefijo}-${correlativo}-${year}${month}${day}-${unidadUsuario.toUpperCase()}`;
        setCodigoGenerado(codigo);

        return push(equipoRef, {
          tipoEquipo,
          fechaAdquisicion,
          codigo,
          estado: 'Activo',
        });
      }).then(() => {
        setModalTitle('Registro Exitoso');
        setModalMessage('El equipo ha sido registrado exitosamente.');
        setShowModal(true);
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

  const handleAddNewType = () => {
    if (newType && newDescription) {
      const db = getDatabase();
      const tiposRef = ref(db, `fundacion/tiposEquipos/${newType}`);
      
      update(tiposRef, {
        nombre: newDescription,
        prefijo: newType,
      }).then(() => {
        setModalTitle('Nuevo Tipo Registrado');
        setModalMessage('El nuevo tipo de equipo ha sido registrado exitosamente.');
        setShowModal(true);
        setShowNewTypeModal(false);  // Cierra el modal de nuevo tipo
        setNewType('');  // Limpia el campo de tipo
        setNewDescription('');  // Limpia el campo de descripción
        setTiposEquipos({ ...tiposEquipos, [newType]: { nombre: newDescription, prefijo: newType } });  // Actualiza la lista local
      }).catch((error) => {
        setModalTitle('Error al Registrar');
        setModalMessage('Error al registrar el nuevo tipo de equipo: ' + error.message);
        setShowModal(true);
      });
    } else {
      setModalTitle('Campos Incompletos');
      setModalMessage('Por favor, complete todos los campos para el nuevo tipo.');
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleShowNewTypeModal = () => {
    setShowNewTypeModal(true);
  };

  const handleCloseNewTypeModal = () => {
    setShowNewTypeModal(false);
  };

  return (
    <>
      <NavBar handleSignOut={handleSignOut} />

      <div className="clasificacion-codigo-container">
        <h2 className="clasificacion-codigo-header"> Clasificación de Códigos</h2>
        <div className="clasificacion-codigo-form">
          <div className="form-group">
            <label htmlFor="tipoEquipo">Tipo de Equipo:</label>
            <select
              id="tipoEquipo"
              className="form-control"
              value={tipoEquipo}
              onChange={(e) => setTipoEquipo(e.target.value)}
            >
              <option value="">Seleccione</option>
              {Object.entries(tiposEquipos).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.nombre}
                </option>
              ))}
            </select>
            <button className="btn btn-secondary mt-2" onClick={handleShowNewTypeModal}>
              Agregar Nuevo Tipo
            </button>
          </div>
          <div className="form-group">
            <label htmlFor="fechaAdquisicion">Fecha de Adquisición:</label>
            <input
              type="date"
              id="fechaAdquisicion"
              className="form-control"
              value={fechaAdquisicion}
              onChange={(e) => setFechaAdquisicion(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="unidadUsuario">Unidad del Usuario:</label>
            <input
              type="text"
              id="unidadUsuario"
              className="form-control"
              value={unidadUsuario}
              readOnly
            />
          </div>
          <button className="btn btn-primary" onClick={handleGenerateCode}>
            Generar Código
          </button>
        </div>

        {codigoGenerado && (
          <div className="codigo-generado">
            <h3>Código Generado:</h3>
            <p>{codigoGenerado}</p>
          </div>
        )}
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

      <Modal show={showNewTypeModal} onHide={handleCloseNewTypeModal} className="modal-centered" centered>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Nuevo Tipo de Equipo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label htmlFor="newType">Siglas del Tipo de Equipo:</label>
            <input
              type="text"
              id="newType"
              className="form-control"
              value={newType}
              onChange={(e) => setNewType(e.target.value.toUpperCase())}
            />
          </div>
          <div className="form-group">
            <label htmlFor="newDescription">Descripción del Tipo de Equipo:</label>
            <input
              type="text"
              id="newDescription"
              className="form-control"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseNewTypeModal}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleAddNewType}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ClasificacionCodigo;
