import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import './HistorialAsignaciones.css'; // Archivo CSS para el estilo
import { Table, Form, Dropdown } from 'react-bootstrap';
import NavBar from '../../../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../../firebase';

function HistorialAsignaciones() {
  const [historial, setHistorial] = useState([]);
  const [filteredHistorial, setFilteredHistorial] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('');
  const [sortBy, setSortBy] = useState('');
  const navigate = useNavigate();

  // ID del equipo seleccionado para ver el historial (ejemplo: pasado como prop o selección previa)
  const equipoId = "equipo_id_ejemplo";

  useEffect(() => {
    const db = getDatabase();
    const historialRef = ref(db, `asignaciones/${equipoId}`);

    get(historialRef).then((snapshot) => {
      const historialData = snapshot.val();
      const historialArray = [];
      
      if (historialData) {
        Object.entries(historialData).forEach(([id, asignacion]) => {
          historialArray.push({
            id,
            ...asignacion,
          });
        });
      }

      setHistorial(historialArray);
      setFilteredHistorial(historialArray);
    });
  }, [equipoId]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredHistorial(historial.filter(asignacion => 
      asignacion.personalId.toLowerCase().includes(term)
    ));
  };

  const handleFilterChange = (filter) => {
    setFilterBy(filter);
    setFilteredHistorial(historial.filter(asignacion => asignacion.estado === filter));
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    const sortedHistorial = [...filteredHistorial].sort((a, b) => {
      if (sort === 'fecha') return new Date(a.fechaAsignacion) - new Date(b.fechaAsignacion);
      if (sort === 'personal') return a.personalId.localeCompare(b.personalId);
      return 0;
    });
    setFilteredHistorial(sortedHistorial);
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

  return (
    <>
      <NavBar handleSignOut={handleSignOut} />
      <div className="historial-asignaciones-container">
        <h2 className="historial-asignaciones-header">Historial de Asignaciones</h2>
        
        <Form.Control 
          type="text" 
          placeholder="Buscar por personal..." 
          value={searchTerm} 
          onChange={handleSearch} 
          className="mb-3"
        />
        
        <Dropdown onSelect={handleFilterChange} className="mb-3">
          <Dropdown.Toggle variant="success" id="dropdown-basic">
            Filtrar por Estado
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item eventKey="Asignado">Asignado</Dropdown.Item>
            <Dropdown.Item eventKey="Devuelto">Devuelto</Dropdown.Item>
            <Dropdown.Item eventKey="Baja">Baja</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        <Dropdown onSelect={handleSortChange} className="mb-3">
          <Dropdown.Toggle variant="info" id="dropdown-basic">
            Ordenar por
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item eventKey="fecha">Fecha de Asignación</Dropdown.Item>
            <Dropdown.Item eventKey="personal">Personal</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Personal</th>
              <th>Fecha de Asignación</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistorial.map((asignacion, index) => (
              <tr key={index}>
                <td>{asignacion.personalId}</td> {/* Aquí podrías hacer un lookup para mostrar el nombre real */}
                <td>{new Date(asignacion.fechaAsignacion).toLocaleDateString()}</td>
                <td>{asignacion.estado}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </>
  );
}

export default HistorialAsignaciones;
