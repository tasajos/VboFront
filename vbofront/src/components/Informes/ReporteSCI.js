import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Pagination from 'react-bootstrap/Pagination';
import Button from 'react-bootstrap/Button';
import * as XLSX from 'xlsx';
import './ReporteSCI.css';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import NavBar from '../NavBar/navbar';

const ReporteSCI = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [formFilter, setFormFilter] = useState('');
  const [incidentFilter, setIncidentFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(20);
  const navigate = useNavigate();

  useEffect(() => {
    const db = getDatabase();
    const formRef = ref(db, 'formulariosci');

    onValue(formRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const flatData = flattenData(data);
        setData(flatData);
        setFilteredData(flatData);
      }
    });
  }, []);

  const flattenData = (data) => {
    let flatData = [];
    Object.entries(data).forEach(([formKey, incidents]) => {
      Object.values(incidents).forEach((incident) => {
        flatData.push({ formKey, ...incident });
      });
    });
    return flatData;
  };

  const handleFilter = () => {
    const lowerSearch = search.toLowerCase();
    const filtered = data.filter((entry) => {
      const entryDate = new Date(entry.fechaHora).toISOString().slice(0, 10); // Format YYYY-MM-DD
      const dateMatch = dateFilter ? entryDate === dateFilter : true;
      const formMatch = formFilter ? (entry.formKey?.toLowerCase() || '').includes(formFilter.toLowerCase()) : true;
      const incidentMatch = incidentFilter
        ? (entry.nombreIncidente?.toLowerCase() || '').includes(incidentFilter.toLowerCase())
        : true;
      const searchMatch = lowerSearch
        ? (entry.nombreIncidente?.toLowerCase() || '').includes(lowerSearch) ||
          (entry.formKey?.toLowerCase() || '').includes(lowerSearch)
        : true;

      return dateMatch && formMatch && incidentMatch && searchMatch;
    });
    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page on filter
  };

  const handleClearFilters = () => {
    setSearch('');
    setDateFilter('');
    setFormFilter('');
    setIncidentFilter('');
    setFilteredData(data); // Reset to original data
    setCurrentPage(1); // Reset to first page
  };

  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1); // Reset to first page on records per page change
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

  const downloadExcel = (entry) => {
    const rows = [];

    if (entry.registroPersonal) {
      Object.values(entry.registroPersonal).forEach((personal, index) => {
        rows.push({
          Formulario: entry.formKey,
          Incidente: entry.nombreIncidente,
          'Fecha y Hora': new Date(entry.fechaHora).toLocaleString(),
          Registro: index + 1,
          Nombre: personal.nombre || '',
          Institución: personal.institucion || '',
          'Hora de Entrada': personal.horaEntrada || '',
          'Hora de Salida': personal.horaSalida || '',
        });
      });
    } else {
      rows.push({
        Formulario: entry.formKey,
        Incidente: entry.nombreIncidente,
        'Fecha y Hora': new Date(entry.fechaHora).toLocaleString(),
        Registro: '',
        Nombre: '',
        Institución: '',
        'Hora de Entrada': '',
        'Hora de Salida': '',
      });
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');

    XLSX.writeFile(wb, `Reporte_${entry.formKey}_${entry.nombreIncidente}.xlsx`);
  };

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      <NavBar handleSignOut={handleSignOut} />
      <div className="report-container">
        <h2 className="report-title">Reporte SCI</h2>

        <div className="filter-section">
          <Form.Control
            type="text"
            placeholder="Buscar por incidente o formulario"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Form.Control
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          <Form.Control
            type="text"
            placeholder="Filtrar por formulario"
            value={formFilter}
            onChange={(e) => setFormFilter(e.target.value)}
          />
          <Form.Control
            type="text"
            placeholder="Filtrar por incidente"
            value={incidentFilter}
            onChange={(e) => setIncidentFilter(e.target.value)}
          />
          <Button variant="primary" onClick={handleFilter}>
            Aplicar Filtros
          </Button>
          <Button variant="warning" onClick={handleClearFilters} className="ml-2">
            Limpiar Filtros
          </Button>
        </div>

        <Table striped bordered hover responsive className="report-table">
          <thead>
            <tr>
              <th>Formulario</th>
              <th>Incidente</th>
              <th>Fecha y Hora</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((entry, index) => (
              <tr key={index}>
                <td>{entry.formKey}</td>
                <td>{entry.nombreIncidente}</td>
                <td>{new Date(entry.fechaHora).toLocaleString()}</td>
                <td>
                  <Button variant="success" onClick={() => downloadExcel(entry)}>
                    Descargar XLS
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <div className="pagination-container">
          <Form.Control
            as="select"
            value={recordsPerPage}
            onChange={handleRecordsPerPageChange}
          >
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </Form.Control>
          <Pagination>
            {[...Array(totalPages).keys()].map((number) => (
              <Pagination.Item
                key={number + 1}
                active={number + 1 === currentPage}
                onClick={() => paginate(number + 1)}
              >
                {number + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        </div>
      </div>
    </div>
  );
};

export default ReporteSCI;