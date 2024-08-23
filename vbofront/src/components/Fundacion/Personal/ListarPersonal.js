import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import NavBar from '../../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../firebase';
import './ListarPersonal.css';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';

function ListarPersonal() {
  const [personalList, setPersonalList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPersonal, setFilteredPersonal] = useState([]);
  const [unidad, setUnidad] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unidadAutenticada = localStorage.getItem('userUnit');
    setUnidad(unidadAutenticada || '');

    const db = getDatabase();
    const personalRef = ref(db, 'fundacion/personal');

    onValue(personalRef, (snapshot) => {
      const personalData = snapshot.val();
      const personalArray = personalData ? Object.keys(personalData).map(key => ({
        id: key,
        ...personalData[key],
      })) : [];

      const filteredByUnit = personalArray.filter(personal => personal.unidad === unidadAutenticada);
      setPersonalList(filteredByUnit);
      setFilteredPersonal(filteredByUnit);
    });
  }, [unidad]);

  useEffect(() => {
    const results = personalList.filter(personal =>
      personal.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      personal.apellidoPaterno.toLowerCase().includes(searchTerm.toLowerCase()) ||
      personal.apellidoMaterno.toLowerCase().includes(searchTerm.toLowerCase()) ||
      personal.ci.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPersonal(results);
  }, [searchTerm, personalList]);

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
      <div className="personal-list-background">
        <div className="personal-list-container">
          <h2 className="text-center mb-4">Listado de Personal</h2>
          <Form.Control
            type="text"
            placeholder="Buscar por nombre, apellido o CI"
            className="mb-3"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Table striped bordered hover responsive className="text-center">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido Paterno</th>
                <th>Apellido Materno</th>
                <th>Sexo</th>
                <th>Teléfono</th>
                <th>CI</th>
                <th>Fecha de Nacimiento</th>
                <th>Correo Electrónico</th>
                <th>Dirección</th>
                <th>Ciudad</th>
                <th>Unidad</th>
              </tr>
            </thead>
            <tbody>
              {filteredPersonal.map(personal => (
                <tr key={personal.id}>
                  <td>{personal.nombre}</td>
                  <td>{personal.apellidoPaterno}</td>
                  <td>{personal.apellidoMaterno}</td>
                  <td>{personal.sexo}</td>
                  <td>{personal.telefono}</td>
                  <td>{personal.ci}</td>
                  <td>{personal.fechaNacimiento}</td>
                  <td>{personal.correo}</td>
                  <td>{personal.direccion}</td>
                  <td>{personal.ciudad}</td>
                  <td>{personal.unidad}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default ListarPersonal;
