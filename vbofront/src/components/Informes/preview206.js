import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import './preview.css';
import NavBar from '../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';

function Preview206() {
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
    const formRef = ref(db, 'formulariosci/206');

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

  if (formularios.length === 0) {
    return <div>Cargando formularios...</div>;
  }

  const form = formularios[currentForm];

  return (
    <div>
      <NavBar handleSignOut={handleSignOut} />
      <div className="form-preview-container">
        <div className="form-preview-header">
          <h2>SCI 206 - Plan Médico</h2>
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
              <td>Recursos Médicos Disponibles:</td>
              <td>{form.recursosMedicos || 'No especificado'}</td>
            </tr>
            <tr>
              <td>Punto de Atención Médica:</td>
              <td>{form.puntoAtencion || 'No especificado'}</td>
            </tr>
            <tr>
              <td>Procedimientos Médicos:</td>
              <td>{form.procedimientosMedicos || 'No especificado'}</td>
            </tr>
            <tr>
              <td>Contactos Médicos:</td>
              <td>{form.contactosMedicos || 'No especificado'}</td>
            </tr>
          </tbody>
        </table>
        <div className="form-preview-footer">
          <button onClick={handlePrevious} disabled={formularios.length <= 1}>Anterior</button>
          <button onClick={handleNext} disabled={formularios.length <= 1}>Siguiente</button>
        </div>
      </div>
    </div>
  );
}

export default Preview206;
