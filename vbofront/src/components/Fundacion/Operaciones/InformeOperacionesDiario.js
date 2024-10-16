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
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function InformeOperacionesDiario() {
  const [operacionesList, setOperacionesList] = useState([]);
  const [searchDate, setSearchDate] = useState('');
  const [filteredOperaciones, setFilteredOperaciones] = useState([]);
  const [unidad, setUnidad] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
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
                  ci: personalData[key].ci,
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
    if (searchDate === '') {
      setFilteredOperaciones(operacionesList);
    } else {
      const results = operacionesList.filter((operacion) => {
        const fechaOperacionISO = operacion.fechaOperacion.split('T')[0];
        return fechaOperacionISO === searchDate;
      });
      setFilteredOperaciones(results);
    }
  }, [searchDate, operacionesList]);

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

  const formatFecha = (fechaISO) => {
    const date = new Date(fechaISO);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const agruparPorVoluntarioYOperacion = (operaciones) => {
    const agrupados = {};
    operaciones.forEach((operacion) => {
      const voluntario = `${operacion.nombre} ${operacion.apellidoPaterno} ${operacion.apellidoMaterno}`;
      const tipoOperacion = operacion.operacion;

      if (!agrupados[voluntario]) {
        agrupados[voluntario] = {};
      }
      if (!agrupados[voluntario][tipoOperacion]) {
        agrupados[voluntario][tipoOperacion] = 0;
      }
      agrupados[voluntario][tipoOperacion]++;
    });
    return agrupados;
  };

  const calcularTotalOperacionesPorVoluntario = (operaciones) => {
    const totales = {};
    operaciones.forEach((operacion) => {
      const voluntario = `${operacion.nombre} ${operacion.apellidoPaterno} ${operacion.apellidoMaterno}`;
      if (!totales[voluntario]) {
        totales[voluntario] = 0;
      }
      totales[voluntario]++;
    });
    return totales;
  };

  const generarDatosDeGrafico = (agrupados) => {
    const voluntarios = Object.keys(agrupados);
    const tiposDeOperacion = [...new Set(Object.values(agrupados).flatMap((op) => Object.keys(op)))];
  
    const datasets = tiposDeOperacion.map((operacion) => ({
      label: operacion,
      data: voluntarios.map((voluntario) => agrupados[voluntario][operacion] || 0),
      backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.7)`,
    }));
  
    return {
      labels: voluntarios,
      datasets: datasets,
    };
  };


  const generarDatosDeGraficoPorVoluntario = (totales) => {
    const voluntarios = Object.keys(totales);
    const cantidades = voluntarios.map((voluntario) => totales[voluntario]);

    return {
      labels: voluntarios,
      datasets: [{
        label: 'Cantidad de Operaciones',
        data: cantidades,
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
      }],
    };
  };

  const dataDeGrafico = generarDatosDeGrafico(agruparPorVoluntarioYOperacion(filteredOperaciones));

  return (
    <div>
      <NavBar handleSignOut={handleSignOut} />
      <div className="informe-operaciones-diario-container">
        <h2 className="informe-operaciones-diario-header">Informe Diario de Operaciones</h2>
        <Form.Control
          type="date"
          className="informe-operaciones-diario-date-filter mb-3"
          onChange={(e) => setSearchDate(e.target.value)}
        />
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
              <th>CI</th>
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
                <td>{operacion.ci}</td>
                <td>{formatFecha(operacion.fechaOperacion)}</td>
                <td>{operacion.operacion}</td>
                <td>{operacion.autorizadoPor}</td>
                <td>{operacion.observaciones}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Resumen de operaciones agrupadas */}
        <div className="resumen-container">
          <h5>Resumen por Voluntario y Operación</h5>
          <Table striped bordered hover responsive className="resumen-operaciones-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Operación</th>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(agruparPorVoluntarioYOperacion(filteredOperaciones)).map((voluntario) => (
                Object.keys(agruparPorVoluntarioYOperacion(filteredOperaciones)[voluntario]).map((operacion, index) => (
                  <tr key={voluntario + operacion + index}>
                    <td>{voluntario}</td>
                    <td>{operacion}</td>
                    <td>{agruparPorVoluntarioYOperacion(filteredOperaciones)[voluntario][operacion]}</td>
                  </tr>
                ))
              ))}
            </tbody>
          </Table>
        </div>

        {/* Gráfico de barras por tipo de operación */}
        <div className="grafico-container">
          <h5>Estadísticas por Operación</h5>
          <Bar data={dataDeGrafico} options={{ maintainAspectRatio: false }} />
        </div>

        {/* Gráfico de barras por voluntario */}
        <div className="grafico-container">
          <h5>Operaciones Totales por Voluntario</h5>
          <Bar data={generarDatosDeGraficoPorVoluntario(calcularTotalOperacionesPorVoluntario(filteredOperaciones))} options={{ maintainAspectRatio: false }} />
        </div>

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

export default InformeOperacionesDiario;
