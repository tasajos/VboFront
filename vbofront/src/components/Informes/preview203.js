import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import './preview.css';
import NavBar from '../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';

function Preview203() {
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
    const formRef = ref(db, 'formulariosci/203');

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
          <h2>SCI 203 - Organización del Incidente</h2>
          <p>- Detalla la estructura organizativa del incidente.</p>
          <p>- Incluye información sobre el Comandante del Incidente, el personal clave y sus roles.</p>
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
              <td>Comandante del Incidente:</td>
              <td>{form.comandanteIncidente || 'No especificado'}</td>
            </tr>
          </tbody>
          <thead>
            <tr>
              <th colSpan="3">SEGUNDA PARTE</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="3">Personal Clave y Roles:</td>
            </tr>
            <tr>
              <th>Rol</th>
              <th>Nombre</th>
              <th>Contacto</th>
            </tr>
            {form.roles ? (
              Object.entries(form.roles).map(([rol, detalle], index) => (
                <tr key={index}>
                  <td>{rol}</td>
                  <td>{detalle.nombre || 'No especificado'}</td>
                  <td>{detalle.contacto || 'No especificado'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No hay roles especificados</td>
              </tr>
            )}
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

export default Preview203;
