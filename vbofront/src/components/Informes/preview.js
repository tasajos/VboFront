import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import html2pdf from 'html2pdf.js';
import './preview.css';
import NavBar from '../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';

function Preview() {
  const [formularios, setFormularios] = useState([]);
  const [currentForm, setCurrentForm] = useState(0);
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
    const formRef = ref(db, 'formulariosci/201');

    const unsubscribe = onValue(formRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setFormularios(formList);
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
    const element = document.getElementById('form-content');
    const opt = {
      margin: 1,
      filename: `Formulario_SCI_201_${form.incidentName || 'Desconocido'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
  };

  if (formularios.length === 0) {
    return <div>Cargando formularios...</div>;
  }

  const form = formularios[currentForm];

  return (
    <div>
      <NavBar handleSignOut={handleSignOut} />
      <div className="form-preview-container">
        <div id="form-content">
          <div className="form-preview-header">
            <h2>SCI 201 - Resumen de la Situación del Incidente</h2>
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
                <td>{form.incidentName || 'No especificado'}</td>
              </tr>
              <tr>
                <td>Fecha y Hora:</td>
                <td>{form.dateTime || 'No especificado'}</td>
              </tr>
              <tr>
                <td>Ubicación:</td>
                <td>{form.location || 'No especificado'}</td>
              </tr>
              <tr>
                <td>Mando del Incidente:</td>
                <td>{form.commandUnit || 'No especificado'}</td>
              </tr>
            </tbody>
            <thead>
              <tr>
                <th colSpan="2">SEGUNDA PARTE</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Descripción del Incidente:</td>
                <td>{form.incidentDescription || 'No especificado'}</td>
              </tr>
            </tbody>
            <thead>
              <tr>
                <th colSpan="2">TERCERA PARTE</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Acciones Tomadas:</td>
                <td>{form.actionsTaken || 'No especificado'}</td>
              </tr>
              <tr>
                <td>Objetivos del Incidente:</td>
                <td>{form.incidentObjectives || 'No especificado'}</td>
              </tr>
              <tr>
                <td>Recursos Asignados:</td>
                <td>{form.resourcesAssigned || 'No especificado'}</td>
              </tr>
              <tr>
                <td>Notas Adicionales:</td>
                <td>{form.additionalNotes || 'No especificado'}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="form-preview-footer">
          <button onClick={handlePrevious} disabled={formularios.length <= 1}>Anterior</button>
          <button onClick={handleNext} disabled={formularios.length <= 1}>Siguiente</button>
          <button onClick={exportToPDF}>Exportar a PDF</button>
        </div>
      </div>
    </div>
  );
}

export default Preview;
