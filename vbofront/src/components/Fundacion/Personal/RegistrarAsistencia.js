import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import { auth } from '../../../firebase';
import Button from 'react-bootstrap/Button';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './RegistroAsistencia.css'; // Asegúrate de cambiar la ruta si es necesario
import NavBar from '../../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import Modal from 'react-bootstrap/Modal';

function RegistroAsistencia() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [asistenciaData, setAsistenciaData] = useState([]);
  const [sortedData, setSortedData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [userUnit, setUserUnit] = useState('');
  const [showModal, setShowModal] = useState(false); // Estado para controlar el modal

  const navigate = useNavigate();

  useEffect(() => {
    const unidadAutenticada = localStorage.getItem('userUnit');
    if (unidadAutenticada) {
      setUserUnit(unidadAutenticada);
    }
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

  const handleDateChange = (date) => {
    setSelectedDate(date);

    if (date) {
      const db = getDatabase();
      const personalRef = ref(db, 'fundacion/personal');

      onValue(personalRef, (snapshot) => {
        const personalData = snapshot.val();
        const personalDeUnidad = personalData
          ? Object.values(personalData).filter((personal) => 
              personal.unidad === userUnit && personal.estado === 'Activo')
          : [];

        setAsistenciaData(personalDeUnidad);
        setSortedData(personalDeUnidad); // Inicializa con los datos sin ordenar
      });
    }
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }

    const sortedArray = [...asistenciaData].sort((a, b) => {
      const aValue = a[key] || ''; // Si el valor es null o undefined, se convierte en cadena vacía
      const bValue = b[key] || ''; // Si el valor es null o undefined, se convierte en cadena vacía

      if (aValue < bValue) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    setSortedData(sortedArray);
    setSortConfig({ key, direction });
  };

  const handleAttendanceChange = (index, value) => {
    const updatedData = [...sortedData];
    updatedData[index].asistio = value;
    setSortedData(updatedData);
  };

  const handleSaveAttendance = () => {
    if (!selectedDate) return;

    const db = getDatabase();
    const dateKey = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD

    sortedData.forEach((personal) => {
      if (personal.asistio) {
        const asistenciaRef = ref(db, `fundacion/personal/${personal.ci}/asistencia/${dateKey}`);
        const asistenciaData = {
          fecha: dateKey,
          unidad: personal.unidad,
          asistio: personal.asistio
        };
        update(asistenciaRef, asistenciaData).catch((error) => {
          console.error("Error al guardar la asistencia:", error);
        });
      }
    });

    setShowModal(true); // Mostrar el modal después de guardar
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div>
      <NavBar handleSignOut={handleSignOut} />
      <div className="registro-asistencia-container">
        <div className="registro-asistencia-wrapper">
          <h2 className="registro-asistencia-text-center registro-asistencia-mb-4">Registro de Asistencia</h2>

          <Form className="registro-asistencia-form">
            <Form.Group controlId="formFechaAsistencia">
              <Form.Label>Selecciona una Fecha:</Form.Label>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy"
                className="form-control"
              />
            </Form.Group>
          </Form>

          {selectedDate && sortedData.length > 0 && (
            <>
              <Table striped bordered hover className="mt-4">
                <thead>
                  <tr>
                    <th>#</th>
                    <th onClick={() => handleSort('grado')}>Grado {sortConfig.key === 'grado' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}</th>
                    <th onClick={() => handleSort('nombre')}>Nombre {sortConfig.key === 'nombre' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}</th>
                    <th onClick={() => handleSort('apellidoPaterno')}>Apellido Paterno {sortConfig.key === 'apellidoPaterno' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}</th>
                    <th onClick={() => handleSort('apellidoMaterno')}>Apellido Materno {sortConfig.key === 'apellidoMaterno' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}</th>
                    <th onClick={() => handleSort('codigo')}>Código {sortConfig.key === 'codigo' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}</th>
                    <th>Asistencia</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((personal, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{personal.grado || 'N/A'}</td>
                      <td>{personal.nombre}</td>
                      <td>{personal.apellidoPaterno}</td>
                      <td>{personal.apellidoMaterno}</td>
                      <td>{personal.codigo || 'N/A'}</td>
                      <td>
                        <Form.Check
                          type="checkbox"
                          label="Asistió"
                          checked={personal.asistio || false}
                          onChange={(e) => handleAttendanceChange(index, e.target.checked)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <Button variant="primary" className="mt-3" onClick={handleSaveAttendance}>
                Guardar Asistencia
              </Button>
            </>
          )}

          {selectedDate && sortedData.length === 0 && (
            <p className="text-center mt-4">No se encontraron registros para esta fecha.</p>
          )}
        </div>
      </div>

      {/* Modal de confirmación centrado */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Asistencia Guardada</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          La asistencia ha sido guardada exitosamente.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCloseModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default RegistroAsistencia;
