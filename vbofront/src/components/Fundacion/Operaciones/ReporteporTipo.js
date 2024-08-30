import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import NavBar from '../../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../firebase';
import './InformeOperacionesDiario.css';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Pagination from 'react-bootstrap/Pagination';
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';
import * as XLSX from 'xlsx';

function ReporteporTipo() {
  const [operacionesList, setOperacionesList] = useState([]);
  const [searchDate, setSearchDate] = useState('');
  const [filteredOperaciones, setFilteredOperaciones] = useState([]);
  const [unidad, setUnidad] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [tipoOperacion, setTipoOperacion] = useState(''); // Estado para el tipo de operación
  const navigate = useNavigate();

  useEffect(() => {
    const unidadAutenticada = localStorage.getItem('userUnit');
    setUnidad(unidadAutenticada || '');

    const db = getDatabase();
    const personalRef = ref(db, 'fundacion/personal');

    onValue(personalRef, (snapshot) => {
      const personalData = snapshot.val();
      const operacionesArray = [];

      if (personalData) {
        Object.keys(personalData).forEach((key) => {
          if (personalData[key].operaciones && personalData[key].unidad === unidadAutenticada) {
            personalData[key].operaciones.forEach((operacion) => {
              if (operacion.estado === 'Aprobado') {
                operacionesArray.push({
                  ...operacion,
                  nombre: personalData[key].nombre,
                  apellidoPaterno: personalData[key].apellidoPaterno,
                  apellidoMaterno: personalData[key].apellidoMaterno,
                  codigo: personalData[key].codigo,
                  
                });
              }
            });
          }
        });
      }

      setOperacionesList(operacionesArray);
      setFilteredOperaciones(operacionesArray);
    });
  }, [unidad]);

  useEffect(() => {
    let results = operacionesList;

    if (searchDate) {
      results = results.filter((operacion) =>
        operacion.fecha.includes(searchDate)
      );
    }

    if (tipoOperacion) {
      results = results.filter((operacion) =>
        operacion.operacion === tipoOperacion
      );
    }

    setFilteredOperaciones(results);
  }, [searchDate, tipoOperacion, operacionesList]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/signin');
      console.log('Sesión cerrada');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

  const handleExportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredOperaciones);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Operaciones');
    XLSX.writeFile(wb, 'InformeOperacionesDiario.xlsx');
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredOperaciones.slice(indexOfFirstRecord, indexOfLastRecord);

  const totalPages = Math.ceil(filteredOperaciones.length / recordsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleRecordsPerPageChange = (numRecords) => {
    setRecordsPerPage(numRecords);
    setCurrentPage(1);
  };

  return (
    <div>
      <NavBar handleSignOut={handleSignOut} />
      <div className="informe-operaciones-diario-container">
        <h2 className="informe-operaciones-diario-header">Informe de Operaciones por Tipo</h2>
        <Form.Control
          type="date"
          className="informe-operaciones-diario-date-filter mb-3"
          onChange={(e) => setSearchDate(e.target.value)}
        />
        <Form.Control
          as="select"
          className="informe-operaciones-diario-tipo-filter mb-3"
          onChange={(e) => setTipoOperacion(e.target.value)}
          value={tipoOperacion}
        >
          <option value="">Seleccionar Tipo de Operación</option>
          {Array.from(new Set(operacionesList.map(op => op.operacion))).map((tipo, index) => (
            <option key={index} value={tipo}>{tipo}</option>
          ))}
        </Form.Control>
        <Dropdown className="mb-3">
          <Dropdown.Toggle variant="success" id="dropdown-basic">
            Registros por página: {recordsPerPage}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={() => handleRecordsPerPageChange(10)}>10</Dropdown.Item>
            <Dropdown.Item onClick={() => handleRecordsPerPageChange(20)}>20</Dropdown.Item>
            <Dropdown.Item onClick={() => handleRecordsPerPageChange(50)}>50</Dropdown.Item>
            <Dropdown.Item onClick={() => handleRecordsPerPageChange(100)}>100</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Table striped bordered hover responsive className="informe-operaciones-diario-table">
          <thead>
            <tr>
              <th>Nro</th>
              <th>Nombre</th>
              <th>Apellido Paterno</th>
              <th>Apellido Materno</th>
              <th>Codigo</th>
              <th>Fecha</th>
              <th>Operación</th>
              <th>Autorizado por</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
  {currentRecords.map((operacion, index) => (
    <tr key={index}>
      <td>{indexOfFirstRecord + index + 1}</td>
      <td>{operacion.nombre}</td>
      <td>{operacion.apellidoPaterno}</td>
      <td>{operacion.apellidoMaterno}</td>
      <td>{operacion.codigo}</td>
      <td>{new Date(operacion.fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
      </td>
      <td>{operacion.operacion}</td>
      <td>{operacion.autorizadoPor}</td>
      <td>{operacion.observaciones}</td>
    </tr>
  ))}
</tbody>
        </Table>
        <div className="d-flex justify-content-end">
          <Button variant="success" className="mt-3" onClick={handleExportToExcel}>
            Exportar a Excel
          </Button>
        </div>
        <Pagination className="informe-operaciones-diario-pagination">
          {[...Array(totalPages)].map((_, index) => (
            <Pagination.Item
              key={index + 1}
              active={index + 1 === currentPage}
              onClick={() => paginate(index + 1)}
            >
              {index + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      </div>
    </div>
  );
}

export default ReporteporTipo;
