import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import './HistorialAsignaciones.css'; // Archivo CSS para el estilo
import { Table, Form } from 'react-bootstrap';
import NavBar from '../../../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../../firebase';

function HistorialAsignaciones() {
  const [historial, setHistorial] = useState([]);
  const [unidadUsuario, setUnidadUsuario] = useState(localStorage.getItem('userUnit') || '');
  const [filteredHistorial, setFilteredHistorial] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [fechaFiltro, setFechaFiltro] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const db = getDatabase();
    const equiposRef = ref(db, `fundacion/equipos/${unidadUsuario}`);

    // Obtener todo el historial de asignaciones agrupado por tipo de equipo
    get(equiposRef).then((snapshot) => {
      const equiposData = snapshot.val();
      const historialArray = [];
      
      if (equiposData) {
        Object.entries(equiposData).forEach(([tipoEquipo, equiposPorTipo]) => {
          Object.entries(equiposPorTipo).forEach(([equipoId, equipo]) => {
            if (equipo.historial) {
              Object.entries(equipo.historial).forEach(([key, registro]) => {
                historialArray.push({
                  id: key,
                  tipoEquipo,
                  ...registro,
                });
              });
            }
          });
        });
      }
      setHistorial(historialArray);
      setFilteredHistorial(historialArray);
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

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    filterHistorial(term, fechaFiltro);
  };

  const handleDateFilter = (e) => {
    const date = e.target.value;
    setFechaFiltro(date);
    filterHistorial(searchTerm, date);
  };

  const filterHistorial = (term, date) => {
    const filtered = historial.filter(registro => {
      const matchesTerm = registro.asignadoA.toLowerCase().includes(term);
      const matchesDate = date ? new Date(registro.fechaAsignacion).toLocaleDateString() === new Date(date).toLocaleDateString() : true;
      return matchesTerm && matchesDate;
    });
    setFilteredHistorial(filtered);
  };

  return (
    <>
      <NavBar handleSignOut={handleSignOut} />
      <div className="historial-asignaciones-container">
        <h2 className="historial-asignaciones-header">Historial de Asignaciones por Tipo de Equipo</h2>
        
        <Form.Control 
          type="text" 
          placeholder="Buscar por personal..." 
          value={searchTerm} 
          onChange={handleSearch} 
          className="mb-3"
        />

        <Form.Control 
          type="date" 
          placeholder="Filtrar por fecha..." 
          value={fechaFiltro} 
          onChange={handleDateFilter} 
          className="mb-3"
        />

        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Tipo de Equipo</th>
              <th>Asignado A</th>
              <th>Fecha de Asignación</th>
              <th>Estado en Asignación</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistorial.map((registro, index) => (
              <tr key={index}>
                <td>{registro.tipoEquipo}</td>
                <td>{registro.asignadoA}</td>
                <td>{new Date(registro.fechaAsignacion).toLocaleDateString()}</td>
                <td>{registro.estado}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </>
  );
}

export default HistorialAsignaciones;
