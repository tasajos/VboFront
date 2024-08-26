import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import DatePicker from 'react-datepicker';
import { auth } from '../../../firebase';
import "react-datepicker/dist/react-datepicker.css";
import './ReportePersonal.css';
import NavBar from '../../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import * as XLSX from 'xlsx';

function ReportePersonal() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [reporteData, setReporteData] = useState([]);
  const [userUnit, setUserUnit] = useState('');

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
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      const personalRef = ref(db, 'fundacion/personal');

      onValue(personalRef, (snapshot) => {
        const personalData = snapshot.val();
        const reporteDeUnidad = personalData
          ? Object.values(personalData).filter((personal) => 
              personal.unidad === userUnit && personal.asistencia && personal.asistencia[dateKey])
          : [];

        setReporteData(reporteDeUnidad);
      });
    }
  };

  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(reporteData.map(personal => ({
      Grado: personal.grado || 'N/A',
      Nombre: personal.nombre,
      'Apellido Paterno': personal.apellidoPaterno,
      'Apellido Materno': personal.apellidoMaterno,
      Código: personal.codigo || 'N/A',
      Asistencia: personal.asistencia[selectedDate.toISOString().split('T')[0]].asistio ? 'Sí' : 'No',
      Fecha: selectedDate.toLocaleDateString()
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Asistencia");
    XLSX.writeFile(wb, `Reporte_Asistencia_${selectedDate.toISOString().split('T')[0]}.xlsx`);
  };

  const shareOnSocialMedia = () => {
    const message = `Reporte de Asistencia para la fecha ${selectedDate.toLocaleDateString()}:\n\n` +
      reporteData.map(personal => 
        `${personal.grado || 'N/A'} ${personal.nombre} ${personal.apellidoPaterno} ${personal.apellidoMaterno} - Asistió: ${personal.asistencia[selectedDate.toISOString().split('T')[0]].asistio ? 'Sí' : 'No'}`
      ).join('\n');
    
    if (navigator.share) {
      navigator.share({
        title: `Reporte de Asistencia ${selectedDate.toLocaleDateString()}`,
        text: message,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert('Tu navegador no soporta la funcionalidad para compartir.');
    }
  };

  return (
    <div>
      <NavBar handleSignOut={handleSignOut} />
      <div className="reporte-personal-container">
        <div className="reporte-personal-wrapper">
          <h2 className="reporte-personal-text-center reporte-personal-mb-4">Reporte de Asistencia</h2>

          <Form className="reporte-personal-form">
            <Form.Group controlId="formFechaReporte">
              <Form.Label>Selecciona una Fecha:</Form.Label>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy"
                className="form-control"
              />
            </Form.Group>
          </Form>

          {selectedDate && reporteData.length > 0 && (
            <>
              <Table striped bordered hover className="mt-4">
                <thead>
                  <tr>
                    <th>Grado</th>
                    <th>Nombre</th>
                    <th>Apellido Paterno</th>
                    <th>Apellido Materno</th>
                    <th>Código</th>
                    <th>Asistencia</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {reporteData.map((personal, index) => (
                    <tr key={index}>
                      <td>{personal.grado || 'N/A'}</td>
                      <td>{personal.nombre}</td>
                      <td>{personal.apellidoPaterno}</td>
                      <td>{personal.apellidoMaterno}</td>
                      <td>{personal.codigo || 'N/A'}</td>
                      <td>{personal.asistencia[selectedDate.toISOString().split('T')[0]].asistio ? 'Sí' : 'No'}</td>
                      <td>{selectedDate.toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <div className="reporte-personal-buttons">
                <Button variant="success" className="mt-3" onClick={downloadExcel}>
                  Descargar en XLS
                </Button>
                <Button variant="info" className="mt-3 ml-2" onClick={shareOnSocialMedia}>
                  Compartir por Redes Sociales
                </Button>
              </div>
            </>
          )}

          {selectedDate && reporteData.length === 0 && (
            <p className="text-center mt-4">No se encontraron registros para esta fecha.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportePersonal;
