import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import NavBar from '../../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../firebase';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Pagination from 'react-bootstrap/Pagination';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './InformeOperacionesDiario.css';

function InformeOperacionesDiario() {
  const [operaciones, setOperaciones] = useState([]);
  const [filteredOperaciones, setFilteredOperaciones] = useState([]);
  const [searchDate, setSearchDate] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [unidad, setUnidad] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unidadAutenticada = localStorage.getItem('userUnit');
    setUnidad(unidadAutenticada || '');

    const db = getDatabase();
    const operacionesRef = ref(db, 'fundacion/personal');

    onValue(operacionesRef, (snapshot) => {
      const personalData = snapshot.val();
      const allOperaciones = [];

      if (personalData) {
        Object.keys(personalData).forEach((key) => {
          const personal = personalData[key];
          if (personal.operaciones && personal.unidad === unidadAutenticada) {
            const operacionesAprobadas = personal.operaciones.filter(
              (operacion) => operacion.estado === 'Aprobado'
            );
            allOperaciones.push(
              ...operacionesAprobadas.map((op) => ({
                ...op,
                personalId: key,
                personalNombre: personal.nombre,
                personalApellidoPaterno: personal.apellidoPaterno,
                personalApellidoMaterno: personal.apellidoMaterno,
              }))
            );
          }
        });
      }

      setOperaciones(allOperaciones);
    });
  }, [unidad]);

  useEffect(() => {
    const results = operaciones.filter((operacion) =>
      formatDate(new Date(operacion.fechaOperacion || operacion.fecha)) === formatDate(searchDate)
    );
    setFilteredOperaciones(results);
  }, [searchDate, operaciones]);

  const formatDate = (date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
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

  // Calcula los registros para la página actual
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredOperaciones.slice(indexOfFirstRecord, indexOfLastRecord);

  const totalPages = Math.ceil(filteredOperaciones.length / recordsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleRecordsPerPageChange = (numRecords) => {
    setRecordsPerPage(numRecords);
    setCurrentPage(1); // Resetea a la primera página
  };

  return (
    <div>
      <NavBar handleSignOut={handleSignOut} />
      <div className="informe-operaciones-diario-container">
        <h2 className="text-center mb-4">Informe Diario de Operaciones Aprobadas</h2>
        <Form.Group controlId="searchDate" className="mb-3">
          <Form.Label>Seleccionar Fecha:</Form.Label>
          <DatePicker
            selected={searchDate}
            onChange={(date) => setSearchDate(date)}
            dateFormat="yyyy-MM-dd"
            className="form-control"
          />
        </Form.Group>
        <Table striped bordered hover responsive className="text-center">
          <thead>
            <tr>
              <th>Nro</th>
              <th>Nombre</th>
              <th>Apellido Paterno</th>
              <th>Apellido Materno</th>
              <th>Operación</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Autorizado por</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((operacion, index) => (
              <tr key={index}>
                <td>{indexOfFirstRecord + index + 1}</td>
                <td>{operacion.personalNombre}</td>
                <td>{operacion.personalApellidoPaterno}</td>
                <td>{operacion.personalApellidoMaterno}</td>
                <td>{operacion.operacion}</td>
                <td>{formatDate(new Date(operacion.fechaOperacion || operacion.fecha))}</td>
                <td>{operacion.estado}</td>
                <td>{operacion.autorizadoPor}</td>
                <td>{operacion.observaciones}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Pagination className="justify-content-center">
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

export default InformeOperacionesDiario;
