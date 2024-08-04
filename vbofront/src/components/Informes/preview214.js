import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import html2pdf from 'html2pdf.js';
import './preview.css';
import NavBar from '../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';

function Preview214() {
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
    const formRef = ref(db, 'formulariosci/214');

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
    const element = document.getElementById('form-content-214');
    const opt = {
      margin: 1,
      filename: `Formulario_SCI_214_${form.nombreIncidente || 'Desconocido'}.pdf`,
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
        <div id="form-content-214">
          <div className="form-preview-header">
            <h2>SCI 214 - Registro de Actividades</h2>
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
                <td>Actividad:</td>
                <td>{form.actividad || 'No especificado'}</td>
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
        <div className="form-preview-footer">
          <button onClick={handlePrevious} disabled={formularios.length <= 1}>Anterior</button>
          <button onClick={handleNext} disabled={formularios.length <= 1}>Siguiente</button>
          <button onClick={exportToPDF}>Exportar a PDF</button>
        </div>
      </div>
    </div>
  );
}

export default Preview214;