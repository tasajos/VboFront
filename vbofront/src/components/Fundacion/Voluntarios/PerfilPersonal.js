import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import Card from 'react-bootstrap/Card';
import NavBar from '../../NavBar/navbar';
import { auth } from '../../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import './PerfilPersonal.css';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

function PerfilPersonal() {
  const [personalData, setPersonalData] = useState(null);
  const [historial, setHistorial] = useState([]);
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
            ? Object.values(personalData).find((personal) => personal.correo === user.email)
            : null;

          if (foundPersonal) {
            setPersonalData(foundPersonal);
            setHistorial(foundPersonal.historial || []);
            setError('');
          } else {
            setPersonalData(null);
            setHistorial([]);
            setError('No se encontró un registro para este usuario.');
          }
        });
      } else {
        setError('No se ha autenticado ningún usuario.');
        setPersonalData(null);
        setHistorial([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const getLastValue = (historial, field) => {
    for (let i = historial.length - 1; i >= 0; i--) {
      if (historial[i][field]) {
        return historial[i][field];
      }
    }
    return 'N/A';
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
      <div className="container-fluid perfil-personal-container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8">
            <h2 className="perfil-personal-text-center perfil-personal-mb-4">Perfil Personal</h2>

            {error && <p className="text-center text-danger">{error}</p>}

            {personalData && (
              <Card className="perfil-personal-card">
                <Card.Body className="d-flex align-items-center flex-column flex-md-row">
                  <div className="perfil-personal-card-left text-center text-md-start">
                    <Card.Img
                      variant="top"
                      src="https://via.placeholder.com/150"
                      className="perfil-personal-profile-image mb-3 mb-md-0"
                    />
                  </div>
                  <div className="perfil-personal-card-right text-center text-md-start">
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

            <h3 className="perfil-personal-text-center perfil-personal-mt-5">Historial</h3>

            {historial.length > 0 ? (
              <div className="perfil-personal-historial">
                <div className="row">
                  {historial.map((entry, index) => (
                    <div key={index} className="col-12 col-md-6 mb-3">
                      <Card className="perfil-personal-historial-card">
                        <Card.Body>
                          <Card.Title className="perfil-personal-historial-card-title">
                            {entry.descripcion}
                          </Card.Title>
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
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center">No se encontró historial para este usuario.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PerfilPersonal;
