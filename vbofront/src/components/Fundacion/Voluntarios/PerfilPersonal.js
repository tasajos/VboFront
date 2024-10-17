import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import Card from 'react-bootstrap/Card';
import NavBar from '../../NavBar/navbar';
import { auth } from '../../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import './PerfilPersonal.css';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns'; // Para formatear fechas

function PerfilPersonal() {
  const [personalData, setPersonalData] = useState(null);
  const [historial, setHistorial] = useState([]); // Estado para almacenar el historial
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const db = getDatabase();
        const personalRef = ref(db, 'fundacion/personal');

        onValue(personalRef, (snapshot) => {
          const personalData = snapshot.val();
          const foundPersonal = personalData 
            ? Object.values(personalData).find(personal => personal.correo === user.email) 
            : null;

          if (foundPersonal) {
            setPersonalData(foundPersonal);
            setHistorial(foundPersonal.historial || []); // Cargamos el historial desde Firebase
            setError('');
          } else {
            setPersonalData(null);
            setHistorial([]); // Si no hay historial, inicializamos como vacío
            setError('No se encontró un registro para este usuario.');
          }
        });
      } else {
        setError('No se ha autenticado ningún usuario.');
        setPersonalData(null);
        setHistorial([]); // Limpia el historial si no hay usuario autenticado
      }
    });

    // Limpiar la suscripción cuando el componente se desmonte
    return () => unsubscribe();
  }, []);

  // Función para obtener el último valor no vacío de un campo específico del historial
  const getLastValue = (historial, field) => {
    // Recorremos el historial de forma inversa para obtener el último valor no vacío
    for (let i = historial.length - 1; i >= 0; i--) {
      if (historial[i][field]) {
        return historial[i][field];
      }
    }
    return 'N/A'; // Si no encuentra ningún valor válido, retorna 'N/A'
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/signin');
      console.log('Sesión cerrada');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

  return (
    <div>
      <NavBar handleSignOut={handleSignOut} />
      <div className="perfil-personal-container">
        <div className="perfil-personal-wrapper">
          <h2 className="perfil-personal-text-center perfil-personal-mb-4">Perfil Personal</h2>

          {error && <p className="text-center text-danger">{error}</p>}

          {personalData && (
            <Card className="perfil-personal-card mx-auto">
              <Card.Body className="d-flex align-items-center">
                <div className="perfil-personal-card-left">
                  <Card.Img
                    variant="top"
                    src="https://via.placeholder.com/150"
                    className="perfil-personal-profile-image"
                  />
                </div>
                <div className="perfil-personal-card-right">
                  <Card.Text className="perfil-personal-card-text">
                    <strong>Nombre:</strong> {personalData.nombre} <br />
                    <strong>Apellido Paterno:</strong> {personalData.apellidoPaterno} <br />
                    <strong>Apellido Materno:</strong> {personalData.apellidoMaterno} <br />
                    <strong>Teléfono:</strong> {personalData.telefono} <br />
                    <strong>Correo:</strong> {personalData.correo} <br />
                    <strong>Grado:</strong> {personalData.grado || getLastValue(historial, 'grado')} <br />
                    <strong>Codigo:</strong> {personalData.codigo || 'N/A'} <br />
                    <strong>Tipo de Sangre:</strong> {personalData.tipoSangre || 'N/A'}
                  </Card.Text>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Mostrar el historial del usuario en tarjetas */}
          <h3 className="perfil-personal-text-center perfil-personal-mt-5">Historial</h3>
          {historial.length > 0 ? (
  <div className="perfil-personal-historial">
    {historial.map((entry, index) => (
      <Card key={index} className="perfil-personal-historial-card">
        <Card.Body>
          <Card.Title className="perfil-personal-historial-card-title">{entry.descripcion}</Card.Title>
          <Card.Text className="perfil-personal-historial-card-text">
            <strong>Fecha:</strong> {format(new Date(entry.fecha), 'dd/MM/yyyy')} <br />
            <strong>Estado:</strong> {entry.estado || getLastValue(historial, 'estado')} <br />
            <strong>Tipo Memo:</strong> {entry.tipoMemo || getLastValue(historial, 'tipoMemo')} <br />
            <strong>Grado:</strong> {entry.grado || getLastValue(historial, 'grado')} <br />
            <strong>Motivo:</strong> {entry.motivo || 'No especificado'} <br />
            <strong>Autorizado por:</strong> {entry.autorizadoPor || 'No especificado'}
          </Card.Text>
        </Card.Body>
      </Card>
    ))}
  </div>
) : (
  <p className="text-center">No se encontró historial para este usuario.</p>
)}
        </div>
      </div>
    </div>
  );
}

export default PerfilPersonal;
