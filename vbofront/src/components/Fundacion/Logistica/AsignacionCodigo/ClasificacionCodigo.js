import React, { useState } from 'react';
import { getDatabase, ref, push, onValue } from 'firebase/database';
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
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const navigate = useNavigate();

  const tipoEquipoOptions = {
    VEH: 'Vehículo',
    EQP: 'Equipo General',
    CR: 'Casco de Rescate',
    CIF: 'Casco de Incendio Forestal',
    CIE: 'Casco de Incendio Estructural',
    CRE: 'Casco de Rescate',
  };

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
      const db = getDatabase();
      const equipoRef = ref(db, `fundacion/equipos/${unidadUsuario}/${tipoEquipo}`);

      onValue(equipoRef, (snapshot) => {
        const equipos = snapshot.val();
        const count = equipos ? Object.keys(equipos).length + 1 : 1;
        const numeroCorrelativo = String(count).padStart(2, '0'); // Asegura que el número tenga al menos 2 dígitos

        const fecha = new Date(fechaAdquisicion);
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');

        const codigo = `${tipoEquipo}-${numeroCorrelativo}-${year}${month}${day}`;
        setCodigoGenerado(codigo);

        // Registro en Firebase
        push(equipoRef, {
          tipoEquipo,
          fechaAdquisicion,
          codigo,
          estado: 'Activo', 
        }).then(() => {
          setModalTitle('Registro Exitoso');
          setModalMessage('El equipo ha sido registrado exitosamente.');
          setShowModal(true);
        }).catch((error) => {
          setModalTitle('Error al Registrar');
          setModalMessage('Error al registrar el equipo: ' + error.message);
          setShowModal(true);
        });
      }, {
        onlyOnce: true
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
    <div>
      <NavBar handleSignOut={handleSignOut} />
      <div className="clasificacion-codigo-container">
        <h2 className="clasificacion-codigo-header">Diseño del Formato de Clasificación de Códigos</h2>
        <div className="clasificacion-codigo-form">
          <div className="form-group">
            <label htmlFor="tipoEquipo">Tipo de Equipo:</label>
            <select
              id="tipoEquipo"
              className="form-control"
              value={tipoEquipo}
              onChange={(e) => setTipoEquipo(e.target.value)}
            >
              <option value="">Seleccione un tipo de equipo</option>
              {Object.entries(tipoEquipoOptions).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
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
              onChange={(e) => setUnidadUsuario(e.target.value.toUpperCase())}
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

        {/* Modal de Confirmación */}
        <Modal
        show={showModal}
        onHide={handleCloseModal}
        className="modal-centered"
        centered
        >
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
      </div>
    </div>
  );
}

export default ClasificacionCodigo;
