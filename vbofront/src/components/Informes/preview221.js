import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import html2pdf from 'html2pdf.js';
import './preview.css';
import NavBar from '../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';

function Preview221() {
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
    const formRef = ref(db, 'formulariosci/221');

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
    const element = document.getElementById('form-content-221');
    const opt = {
      margin: 1,
      filename: `Formulario_SCI_221_${form.nombreIncidente || 'Desconocido'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
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
        <div id="form-content-221">
          <div className="form-preview-header">
            <h2>SCI 221 - Verificación de Desmovilización</h2>
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
                <td>Fecha y Hora de Preparación:</td>
                <td>{form.fechaPreparacion || 'No especificado'}</td>
              </tr>
              <tr>
                <td>Periodo Operacional:</td>
                <td>{form.periodoOperacional || 'No especificado'}</td>
              </tr>
              <tr>
                <td>Tiempo Estimado de Conclusión:</td>
                <td>{form.tiempoConclusion || 'No especificado'}</td>
              </tr>
              <tr>
                <td>Lista de Verificación de la Sección de Planificación:</td>
                <td>{form.verificacionPlanificacion || 'No especificado'}</td>
              </tr>
              <tr>
                <td>Lista de Verificación de la Sección de Operaciones:</td>
                <td>{form.verificacionOperaciones || 'No especificado'}</td>
              </tr>
              <tr>
                <td>Lista de Verificación de la Sección de Logística:</td>
                <td>{form.verificacionLogistica || 'No especificado'}</td>
              </tr>
              <tr>
                <td>Lista de Verificación de la Sección de Administración y Finanzas:</td>
                <td>{form.verificacionAdministracion || 'No especificado'}</td>
              </tr>
              <tr>
                <td>Observaciones:</td>
                <td>{form.observaciones || 'No especificado'}</td>
              </tr>
              <tr>
                <td>Preparado por:</td>
                <td>{form.preparadoPor || 'No especificado'}</td>
              </tr>
              <tr>
                <td>Posición:</td>
                <td>{form.posicion || 'No especificado'}</td>
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

export default Preview221;
