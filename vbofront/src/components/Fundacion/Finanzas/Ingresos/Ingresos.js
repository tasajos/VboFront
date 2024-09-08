import React, { useState, useEffect } from 'react';
import { getDatabase, ref, push, onValue } from 'firebase/database';
import { Table, Form, Button } from 'react-bootstrap';
import './Ingresos.css';
import NavBar from '../../../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../../firebase';

function Ingresos() {
  const [ingresos, setIngresos] = useState([]);
  const [fecha, setFecha] = useState('');
  const [tipo, setTipo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const db = getDatabase();
    const ingresosRef = ref(db, 'fundacion/finanzas/ingresos');

    onValue(ingresosRef, (snapshot) => {
      const data = snapshot.val();
      const ingresosArray = data ? Object.entries(data).map(([id, value]) => ({ id, ...value })) : [];
      setIngresos(ingresosArray);
    });
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/signin');
      console.log('Sesión cerrada');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };


  const handleRegistrarIngreso = () => {
    const db = getDatabase();
    const ingresosRef = ref(db, 'fundacion/finanzas/ingresos');
    
    push(ingresosRef, {
      fecha,
      tipo,
      descripcion,
      monto: parseFloat(monto),
    }).then(() => {
      setFecha('');
      setTipo('');
      setDescripcion('');
      setMonto('');
    });
  };

  return (
    <div>
      <NavBar handleSignOut={handleSignOut} />
    <div className="ingresos-container">
      <h2>Registro de Ingresos</h2>
      
      <Form>
        <Form.Group controlId="fechaIngreso">
          <Form.Label>Fecha</Form.Label>
          <Form.Control 
            type="date" 
            value={fecha} 
            onChange={(e) => setFecha(e.target.value)} 
          />
        </Form.Group>

        <Form.Group controlId="tipoIngreso" className="mt-3">
          <Form.Label>Tipo de Ingreso</Form.Label>
          <Form.Control 
            as="select" 
            value={tipo} 
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value="">Seleccione</option>
            <option value="Donación">Donación</option>
            <option value="Venta">Venta</option>
            <option value="Otro">Otro</option>
          </Form.Control>
        </Form.Group>

        <Form.Group controlId="descripcionIngreso" className="mt-3">
          <Form.Label>Descripción</Form.Label>
          <Form.Control 
            type="text" 
            value={descripcion} 
            onChange={(e) => setDescripcion(e.target.value)} 
          />
        </Form.Group>

        <Form.Group controlId="montoIngreso" className="mt-3">
          <Form.Label>Monto</Form.Label>
          <Form.Control 
            type="number" 
            value={monto} 
            onChange={(e) => setMonto(e.target.value)} 
          />
        </Form.Group>

        <Button className="mt-4" onClick={handleRegistrarIngreso}>Registrar Ingreso</Button>
      </Form>

      <h3 className="mt-5">Lista de Ingresos</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Descripción</th>
            <th>Monto</th>
          </tr>
        </thead>
        <tbody>
          {ingresos.map((ingreso) => (
            <tr key={ingreso.id}>
              <td>{ingreso.fecha}</td>
              <td>{ingreso.tipo}</td>
              <td>{ingreso.descripcion}</td>
              <td>{ingreso.monto}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
    </div>
  );
}

export default Ingresos;
