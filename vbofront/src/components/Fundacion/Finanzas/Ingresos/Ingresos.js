import React, { useState, useEffect } from 'react';
import { getDatabase, ref, push, onValue, child, get } from 'firebase/database';
import { Table, Form, Button, Modal } from 'react-bootstrap';
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
  const [moneda, setMoneda] = useState('Bs');
  const [unidadUsuario, setUnidadUsuario] = useState(localStorage.getItem('userUnit') || '');
  const [showModal, setShowModal] = useState(false);
  const [secuencial, setSecuencial] = useState(1); // Secuencial para las donaciones
  const navigate = useNavigate();

  useEffect(() => {
    const db = getDatabase();
    //const ingresosRef = ref(db, `fundacion/${unidadUsuario}/finanzas/ingresos`);
    const ingresosRef = ref(db, `fundacion/finanzas/${unidadUsuario}/ingresos`);

    onValue(ingresosRef, (snapshot) => {
      const data = snapshot.val();
      const ingresosArray = data ? Object.entries(data).map(([id, value]) => ({ id, ...value })) : [];
      setIngresos(ingresosArray);

      // Calcular el secuencial basado en el último ingreso
      const lastSecuencial = ingresosArray.length > 0 ? Math.max(...ingresosArray.map(ingreso => ingreso.secuencial || 0)) : 0;
      setSecuencial(lastSecuencial + 1);
    });
  }, [unidadUsuario]);

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
    //const ingresosRef = ref(db, `fundacion/${unidadUsuario}/finanzas/ingresos`);
    const ingresosRef = ref(db, `fundacion/finanzas/${unidadUsuario}/ingresos`);
    
    push(ingresosRef, {
      fecha,
      tipo,
      descripcion,
      monto: parseFloat(monto),
      moneda,
      unidad: unidadUsuario, // Agregar unidad del usuario autenticado
      secuencial // Agregar el número secuencial
    }).then(() => {
      // Limpiar campos y mostrar modal
      setFecha('');
      setTipo('');
      setDescripcion('');
      setMonto('');
      setMoneda('Bs');
      setSecuencial(secuencial + 1); // Incrementar el secuencial para el próximo registro
      setShowModal(true);
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
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
            <div className="d-flex">
              <Form.Control 
                type="number" 
                value={monto} 
                onChange={(e) => setMonto(e.target.value)} 
                className="me-2"
              />
              <Form.Control 
                as="select" 
                value={moneda} 
                onChange={(e) => setMoneda(e.target.value)} 
              >
                <option value="Bs">Bs</option>
                <option value="$">$</option>
              </Form.Control>
            </div>
          </Form.Group>

          <Button className="mt-4" onClick={handleRegistrarIngreso}>Registrar Ingreso</Button>
        </Form>

        <h3 className="mt-5">Lista de Ingresos</h3>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th> {/* Columna de secuencial */}
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Descripción</th>
              <th>Monto</th>
              <th>Moneda</th>
              <th>Unidad</th>
            </tr>
          </thead>
          <tbody>
            {ingresos.map((ingreso) => (
              <tr key={ingreso.id}>
                <td>{ingreso.secuencial}</td> {/* Mostrar el secuencial */}
                <td>{ingreso.fecha}</td>
                <td>{ingreso.tipo}</td>
                <td>{ingreso.descripcion}</td>
                <td>{ingreso.monto}</td>
                <td>{ingreso.moneda}</td>
                <td>{ingreso.unidad}</td> {/* Mostrar la unidad registrada */}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Modal para éxito de registro */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Ingreso Registrado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          El ingreso ha sido registrado exitosamente.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCloseModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Ingresos;
