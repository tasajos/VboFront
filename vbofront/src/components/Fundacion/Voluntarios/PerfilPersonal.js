import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import Card from 'react-bootstrap/Card';
import NavBar from '../../NavBar/navbar';
import { auth } from '../../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import './PerfilPersonal.css';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function PerfilPersonal() {
  const [personalData, setPersonalData] = useState(null);
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
            setError('');
          } else {
            setPersonalData(null);
            setError('No se encontró un registro para este usuario.');
          }
        });
      } else {
        setError('No se ha autenticado ningún usuario.');
        setPersonalData(null);
      }
    });

    // Limpiar la suscripción cuando el componente se desmonte
    return () => unsubscribe();
  },
  
  
  []);
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
                    <strong>Grado:</strong> {personalData.grado || 'N/A'} <br />
                    <strong>Codigo:</strong> {personalData.codigo || 'N/A'} <br />
                    <strong>Tipo de Sangre:</strong> {personalData.tipoSangre || 'N/A'}
                  </Card.Text>
                </div>
              </Card.Body>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default PerfilPersonal;
