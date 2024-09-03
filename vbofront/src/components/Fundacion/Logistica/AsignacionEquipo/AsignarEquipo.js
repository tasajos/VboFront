import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, update, push } from 'firebase/database';
import './AsignarEquipo.css'; 
import { Form, Button, Modal } from 'react-bootstrap';
import NavBar from '../../../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../../firebase';

function AsignarEquipo() {
  const [equipos, setEquipos] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [selectedEquipo, setSelectedEquipo] = useState('');
  const [selectedPersonal, setSelectedPersonal] = useState('');
  const [fechaAsignacion, setFechaAsignacion] = useState('');
  const [unidadUsuario, setUnidadUsuario] = useState(localStorage.getItem('userUnit') || '');
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [showAssignedModal, setShowAssignedModal] = useState(false);
  const [assignedTo, setAssignedTo] = useState('');
  const [isAssigned, setIsAssigned] = useState(false); // Nuevo estado para controlar si el equipo está asignado
  const navigate = useNavigate();

  useEffect(() => {
    const db = getDatabase();
    const equiposRef = ref(db, `fundacion/equipos/${unidadUsuario}`);
    const personalRef = ref(db, `fundacion/personal`);

    // Obtener equipos
    get(equiposRef).then((snapshot) => {
      const equiposData = snapshot.val();
      const equiposArray = [];
      if (equiposData) {
        Object.entries(equiposData).forEach(([tipo, equiposPorTipo]) => {
          Object.entries(equiposPorTipo).forEach(([key, equipo]) => {
            if (equipo.estado !== 'Baja') {
              equiposArray.push({
                id: key,
                ...equipo,
                tipoEquipo: tipo,
              });
            }
          });
        });
      }
      setEquipos(equiposArray);
    });

    // Obtener personal
    get(personalRef).then((snapshot) => {
      const personalData = snapshot.val();
      const personalArray = [];
      if (personalData) {
        Object.entries(personalData).forEach(([ci, persona]) => {
          if (persona.estado === 'Activo' && persona.unidad === unidadUsuario) {  // Asegúrate de incluir solo personal activo de la unidad del usuario
            personalArray.push({
              ci, // Usamos el CI como id
              ...persona,
            });
          }
        });
      }
      setPersonal(personalArray);
    });

  }, [unidadUsuario]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/signin');
      console.log('Sesión cerrada');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

  const handleEquipoChange = (e) => {
    const selectedEquipo = equipos.find(eq => eq.id === e.target.value);
    setSelectedEquipo(selectedEquipo);

    if (selectedEquipo && selectedEquipo.estado === 'Asignado') {
      const assignedPerson = personal.find(persona => persona.ci === selectedEquipo.asignadoA);
      setAssignedTo(assignedPerson ? `${assignedPerson.grado} ${assignedPerson.nombre} ${assignedPerson.apellidoPaterno} ${assignedPerson.apellidoMaterno}` : 'Desconocido');
      setShowAssignedModal(true);
      setIsAssigned(true); // Indica que el equipo ya está asignado
    } else {
      setIsAssigned(false); // El equipo no está asignado
    }
  };

  const handleRegisterAssignment = () => {
    if (selectedEquipo && selectedPersonal && fechaAsignacion) {
      const db = getDatabase();
      const equipoRef = ref(db, `fundacion/equipos/${unidadUsuario}/${selectedEquipo.tipoEquipo}/${selectedEquipo.id}`);
      const historialRef = ref(db, `fundacion/equipos/${unidadUsuario}/${selectedEquipo.tipoEquipo}/${selectedEquipo.id}/historial`);

      update(equipoRef, {
        asignadoA: selectedPersonal,
        fechaAsignacion,
        estado: 'Asignado',
      }).then(() => {
        // Guardar en el historial
        return push(historialRef, {
          personalId: selectedPersonal,
          fechaAsignacion,
          estado: 'Asignado',
        });
      }).then(() => {
        setModalTitle('Asignación Exitosa');
        setModalMessage('El equipo ha sido asignado exitosamente.');
        setShowModal(true);
      }).catch((error) => {
        setModalTitle('Error en la Asignación');
        setModalMessage('Error al asignar el equipo: ' + error.message);
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

  const handleCloseAssignedModal = () => {
    setShowAssignedModal(false);
  };

  return (
    <>
      <NavBar handleSignOut={handleSignOut} />
      <div className="asignar-equipo-container">
        <h2 className="asignar-equipo-header">Asignar Equipo</h2>
        <Form>
          <Form.Group controlId="equipoSelect">
            <Form.Label>Seleccionar Equipo:</Form.Label>
            <Form.Control 
              as="select" 
              value={selectedEquipo ? selectedEquipo.id : ''} 
              onChange={handleEquipoChange}
            >
              <option value="">Seleccione un equipo</option>
              {equipos.map((equipo) => (
                <option key={equipo.id} value={equipo.id}>
                  {equipo.nombre} - {equipo.codigo}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="personalSelect" className="mt-3">
            <Form.Label>Seleccionar Personal:</Form.Label>
            <Form.Control 
              as="select" 
              value={selectedPersonal} 
              onChange={(e) => setSelectedPersonal(e.target.value)}
              disabled={isAssigned} // Deshabilitar si el equipo ya está asignado
            >
              <option value="">Seleccione personal</option>
              {personal.map((persona) => (
                <option key={persona.ci} value={persona.ci}>
                  {persona.grado} {persona.nombre} {persona.apellidoPaterno} {persona.apellidoMaterno}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="fechaAsignacion" className="mt-3">
            <Form.Label>Fecha de Asignación:</Form.Label>
            <Form.Control 
              type="date" 
              value={fechaAsignacion} 
              onChange={(e) => setFechaAsignacion(e.target.value)}
              disabled={isAssigned} // Deshabilitar si el equipo ya está asignado
            />
          </Form.Group>

          <Button 
            variant="primary" 
            className="mt-4" 
            onClick={handleRegisterAssignment} 
            disabled={isAssigned} // Deshabilitar el botón si el equipo ya está asignado
          >
            Registrar Asignación
          </Button>
        </Form>
      </div>

      <Modal show={showModal} onHide={handleCloseModal} centered>
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

      <Modal show={showAssignedModal} onHide={handleCloseAssignedModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Equipo Asignado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          El equipo ya está asignado a: <strong>{assignedTo}</strong>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCloseAssignedModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AsignarEquipo;
