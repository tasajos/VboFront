import React, { useState } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import './SeguimientoPersonal.css';
import NavBar from '../../NavBar/navbar';  // Asegúrate de que la ruta sea correcta
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../firebase';

function SeguimientoPersonal() {
  const [ci, setCi] = useState('');
  const [personalData, setPersonalData] = useState(null);
  const [error, setError] = useState('');
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

  const handleSearch = () => {
    const db = getDatabase();
    const personalRef = ref(db, 'fundacion/personal');

    onValue(personalRef, (snapshot) => {
      const personalData = snapshot.val();
      const foundPersonal = personalData ? Object.values(personalData).find(personal => personal.ci === ci) : null;

      if (foundPersonal) {
        setPersonalData(foundPersonal);
        setError('');
      } else {
        setPersonalData(null);
        setError('No se encontró un voluntario con ese carnet de identidad.');
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div>
      <NavBar handleSignOut={handleSignOut} />
      <div className="seguimiento-personal-container">
        <div className="content-wrapper">
          <h2 className="text-center mb-4">Seguimiento de Personal</h2>
          <Form className="d-flex justify-content-center mb-4 search-form" onSubmit={handleSubmit}>
            <Form.Control
              type="text"
              placeholder="Buscar por carnet de identidad"
              className="mr-2 search-input"
              value={ci}
              onChange={(e) => setCi(e.target.value)}
            />
            <Button variant="primary" type="submit" className="search-button">
              Buscar
            </Button>
          </Form>

          {error && <p className="text-center text-danger error-message">{error}</p>}

          {personalData && (
            <Card className="personal-card mx-auto">
              <Card.Body className="d-flex align-items-center">
                <div className="card-left">
                  <Card.Img
                    variant="top"
                    src="https://via.placeholder.com/150" // Aquí podrías agregar la URL de la foto del voluntario si existe
                    className="profile-image"
                  />
                  <div className="name-section">
                    <h4 className="name-text">{personalData.nombre} {personalData.apellidoPaterno} {personalData.apellidoMaterno}</h4>
                    <h6 className="role-text">Voluntario</h6>
                  </div>
                </div>
                <div className="card-right">
                  <Card.Text className="card-text">
                    <strong>CI:</strong> {personalData.ci} <br />
                    <strong>RH:</strong> {personalData.rh || 'N/A'} <br />
                    <strong>E-mail:</strong> {personalData.correo} <br />
                    <strong>Teléfono:</strong> {personalData.telefono} <br />
                    <strong>Dirección:</strong> {personalData.direccion} <br />
                    <strong>Ciudad:</strong> {personalData.ciudad} <br />
                    <strong>Unidad:</strong> {personalData.unidad}
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

export default SeguimientoPersonal;
