import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { storage } from '../../../firebase'; // Asegúrate de importar correctamente tu configuración de Firebase Storage
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './ReportePersonal.css';
import NavBar from '../../NavBar/navbar';
import {auth } from '../../../firebase'; // Asegúrate de que storage está importado
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import Modal from 'react-bootstrap/Modal';
import * as XLSX from 'xlsx';

function ReportePersonal() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [reporteData, setReporteData] = useState([]);
  const [userUnit, setUserUnit] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState(''); // Mensaje del modal

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

  const shareOnSocialMedia = async () => {
    if (!selectedDate) return;

    setModalMessage('Procesando...');
    setShowModal(true);

    try {
      // Crear el archivo Excel en memoria
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
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

      // Subir a Firebase Storage
      const storageReference = storageRef(storage, `Pasistencia/Reporte_Asistencia_${selectedDate.toISOString().split('T')[0]}.xlsx`);
      const uploadResult = await uploadBytes(storageReference, new Blob([excelBuffer], { type: "application/octet-stream" }));

      // Obtener la URL de descarga
      const downloadURL = await getDownloadURL(uploadResult.ref);

      // Compartir la URL por redes sociales
      if (navigator.share) {
        navigator.share({
          title: `Reporte de Asistencia ${selectedDate.toLocaleDateString()}`,
          text: 'Haz clic en el enlace para descargar el reporte de asistencia.',
          url: downloadURL,
        }).catch(console.error);
      } else {
        alert('Tu navegador no soporta la funcionalidad para compartir.');
      }
    } catch (error) {
      console.error('Error al compartir el archivo:', error);
    } finally {
      setShowModal(false); // Cerrar el modal después de procesar
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
              {/*
                <Button variant="info" className="mt-3 ml-2" onClick={shareOnSocialMedia}>
                  Compartir por Redes Sociales
                </Button>*/}
              </div>
            </>
          )}

          {selectedDate && reporteData.length === 0 && (
            <p className="text-center mt-4">No se encontraron registros para esta fecha.</p>
          )}
        </div>
      </div>

      {/* Modal de Procesando */}
      <Modal show={showModal} centered>
        <Modal.Body>{modalMessage}</Modal.Body>
      </Modal>
    </div>
  );
}

export default ReportePersonal;
