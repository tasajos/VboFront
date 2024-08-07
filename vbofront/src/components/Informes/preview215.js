import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import html2pdf from 'html2pdf.js';
import './preview.css';
import NavBar from '../NavBar/navbar';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';

function Preview215() {
  const [formularios, setFormularios] = useState([]);
  const [currentForm, setCurrentForm] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/signin');
      console.log('Sesión cerrada');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

  useEffect(() => {
    const db = getDatabase();
    const formRef = ref(db, 'formulariosci/215');

    const unsubscribe = onValue(formRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setFormularios(formList);
      } else {
        setShowModal(true); // Show the modal if no data is available
      }
    });

    return () => unsubscribe();
  }, []);

  const handleNext = () => {
    setCurrentForm((prev) => (prev + 1) % formularios.length);
  };

  const handlePrevious = () => {
    setCurrentForm((prev) => (prev - 1 + formularios.length) % formularios.length);
  };

  const exportToPDF = () => {
    const element = document.getElementById('form-content-215');
    const opt = {
      margin: 1,
      filename: `Formulario_SCI_215_${formularios[currentForm].nombreIncidente || 'Desconocido'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };
    html2pdf().from(element).set(opt).save();
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const form = formularios[currentForm] || {};

  return (
    <div>
      <NavBar handleSignOut={handleSignOut} />
      <div className="form-preview-container">
        {formularios.length === 0 ? (
          <Modal show={showModal} onHide={closeModal} centered>
            <Modal.Header closeButton>
              <Modal.Title>Datos No Disponibles</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>No hay datos disponibles para mostrar en este momento. Por favor, inténtelo de nuevo más tarde.</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onClick={closeModal}>
                Cerrar
              </Button>
            </Modal.Footer>
          </Modal>
        ) : (
          <div id="form-content-215">
            <div className="form-preview-header">
              <h2>SCI 215 - Registro de Logística</h2>
            </div>
            <table className="form-table">
              <thead>
                <tr>
                  <th colSpan="2">PRIMERA PARTE</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Nombre del Incidente:</td>
                  <td>{form.nombreIncidente || 'No especificado'}</td>
                </tr>
                <tr>
                  <td>Fecha y Hora:</td>
                  <td>{form.fechaHora || 'No especificado'}</td>
                </tr>
                <tr>
                  <td>Recurso:</td>
                  <td>{form.recurso || 'No especificado'}</td>
                </tr>
                <tr>
                  <td>Cantidad:</td>
                  <td>{form.cantidad || 'No especificado'}</td>
                </tr>
                <tr>
                  <td>Estado:</td>
                  <td>{form.estado || 'No especificado'}</td>
                </tr>
                <tr>
                  <td>Ubicación:</td>
                  <td>{form.ubicacion || 'No especificado'}</td>
                </tr>
                <tr>
                  <td>Responsable:</td>
                  <td>{form.responsable || 'No especificado'}</td>
                </tr>
                <tr>
                  <td>Notas Adicionales:</td>
                  <td>{form.notasAdicionales || 'No especificado'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {formularios.length > 0 && (
          <div className="form-preview-footer">
            <button onClick={handlePrevious} disabled={formularios.length <= 1}>
              Anterior
            </button>
            <button onClick={handleNext} disabled={formularios.length <= 1}>
              Siguiente
            </button>
            <button onClick={exportToPDF}>Exportar a PDF</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Preview215;
