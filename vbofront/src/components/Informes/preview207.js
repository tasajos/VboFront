import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import html2pdf from 'html2pdf.js';
import './preview.css';
import NavBar from '../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';

function Preview207() {
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
    const formRef = ref(db, 'formulariosci/207');

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
    const element = document.getElementById('form-content-207');
    const opt = {
      margin: 1,
      filename: `Formulario_SCI_207_${form.nombreVictima || 'Desconocido'}.pdf`,
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
        <div id="form-content-207">
          <div className="form-preview-header">
            <h2>SCI 207 - Registro de Víctimas</h2>
          </div>
          <table className="form-table">
            <tbody>
              <tr>
                <td>Nombre de la Víctima:</td>
                <td>{form.nombreVictima || 'No especificado'}</td>
              </tr>
              <tr>
                <td>Edad de la Víctima:</td>
                <td>{form.edadVictima || 'No especificado'}</td>
              </tr>
              <tr>
                <td>Género de la Víctima:</td>
                <td>{form.generoVictima || 'No especificado'}</td>
              </tr>
              <tr>
                <td>Estado de la Víctima:</td>
                <td>{form.estadoVictima || 'No especificado'}</td>
              </tr>
              <tr>
                <td>Contacto de Emergencia:</td>
                <td>{form.contactoEmergencia || 'No especificado'}</td>
              </tr>
              <tr>
                <td>Observaciones:</td>
                <td>{form.observaciones || 'No especificado'}</td>
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

export default Preview207;