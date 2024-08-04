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

function Preview202() {
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
    const formRef = ref(db, 'formulariosci/202');

    const unsubscribe = onValue(formRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setFormularios(formList);
      } else {
        setShowModal(true); // Show modal if no data is available
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
    const element = document.getElementById('form-content-202');
    const opt = {
      margin: 1,
      filename: `Formulario_SCI_202_${formularios[currentForm]?.nombreIncidente || 'Desconocido'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
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
          <div id="form-content-202">
            <div className="form-preview-header">
              <h2>SCI 202 - Objetivos del Incidente</h2>
              <p>- Se utiliza para registrar y comunicar la información inicial sobre un incidente.</p>
              <p>- Incluye detalles como la descripción del incidente, acciones tomadas, objetivos, recursos asignados, y el mando del incidente.</p>
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
              </tbody>
              <thead>
                <tr>
                  <th colSpan="2">SEGUNDA PARTE</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Objetivos del Incidente:</td>
                  <td>{form.objetivosIncidente || 'No especificado'}</td>
                </tr>
              </tbody>
              <thead>
                <tr>
                  <th colSpan="2">TERCERA PARTE</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Prioridades:</td>
                  <td>{form.prioridades || 'No especificado'}</td>
                </tr>
                <tr>
                  <td>Directrices:</td>
                  <td>{form.directrices || 'No especificado'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {formularios.length > 0 && (
          <div className="form-preview-footer">
            <button onClick={handlePrevious} disabled={formularios.length <= 1}>Anterior</button>
            <button onClick={handleNext} disabled={formularios.length <= 1}>Siguiente</button>
            <button onClick={exportToPDF}>Exportar a PDF</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Preview202;
