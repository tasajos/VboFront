import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import './preview.css';
import NavBar from '../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';

function Preview211() {
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
    const formRef = ref(db, 'formulariosci/211');

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
          <h2>SCI 211 - Registro de Entrada y Salida de Personal</h2>
          <p>- Se utiliza para mantener un registro de todas las personas que entran y salen del área del incidente.</p>
          <p>- Incluye información como el nombre del personal, la institución, la hora de entrada y salida, y el motivo de la entrada/salida.</p>
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
              <th colSpan="4">SEGUNDA PARTE</th>
            </tr>
            <tr>
              <th>Nro</th>
              <th>Nombre</th>
              <th>Institución</th>
              <th>Hora de Entrada</th>
              <th>Hora de Salida</th>
            </tr>
          </thead>
          <tbody>
            {form.registroPersonal
              ? Object.keys(form.registroPersonal).map((key, index) => (
                  <tr key={key}>
                    <td>{index + 1}</td>
                    <td>{form.registroPersonal[key].nombre || 'No especificado'}</td>
                    <td>{form.registroPersonal[key].institucion || 'No especificado'}</td>
                    <td>{form.registroPersonal[key].horaEntrada || 'No especificado'}</td>
                    <td>{form.registroPersonal[key].horaSalida || 'No especificado'}</td>
                  </tr>
                ))
              : (
                <tr>
                  <td colSpan="5">No hay registros de personal</td>
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

export default Preview211;
