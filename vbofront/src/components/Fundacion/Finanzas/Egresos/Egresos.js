import React, { useState, useEffect } from 'react';
import { getDatabase, ref, push, onValue } from 'firebase/database';
import { Table, Form, Button, Modal } from 'react-bootstrap';
import { jsPDF } from 'jspdf';
import './Egresos.css';
import NavBar from '../../../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../../firebase';

function Egresos() {
  const [egresos, setEgresos] = useState([]);
  const [fecha, setFecha] = useState('');
  const [tipo, setTipo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [moneda, setMoneda] = useState('Bs');
  const [unidadUsuario, setUnidadUsuario] = useState(localStorage.getItem('userUnit') || '');
  const [showModal, setShowModal] = useState(false);
  const [secuencial, setSecuencial] = useState(1); // Secuencial para los egresos
  const [lastEgreso, setLastEgreso] = useState(null); // Guardar el último egreso registrado
  const navigate = useNavigate();

  useEffect(() => {
    const db = getDatabase();
    const egresosRef = ref(db, `fundacion/finanzas/${unidadUsuario}/egresos`);

    onValue(egresosRef, (snapshot) => {
      const data = snapshot.val();
      const egresosArray = data ? Object.entries(data).map(([id, value]) => ({ id, ...value })) : [];
      setEgresos(egresosArray);

      // Calcular el secuencial basado en el último egreso
      const lastSecuencial = egresosArray.length > 0 ? Math.max(...egresosArray.map(egreso => egreso.secuencial || 0)) : 0;
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

  const handleRegistrarEgreso = () => {
    const db = getDatabase();
    const egresosRef = ref(db, `fundacion/finanzas/${unidadUsuario}/egresos`);
    
    const nuevoEgreso = {
      fecha,
      tipo,
      descripcion,
      monto: parseFloat(monto),
      moneda,
      unidad: unidadUsuario, // Agregar unidad del usuario autenticado
      secuencial // Agregar el número secuencial
    };

    push(egresosRef, nuevoEgreso).then(() => {
      // Limpiar campos y mostrar modal
      setFecha('');
      setTipo('');
      setDescripcion('');
      setMonto('');
      setMoneda('Bs');
      setSecuencial(secuencial + 1); // Incrementar el secuencial para el próximo registro
      setLastEgreso(nuevoEgreso); // Guardar el último egreso registrado
      setShowModal(true);
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Título del recibo
    doc.setFontSize(18);
    doc.text("Recibo de Egreso", 20, 20);

    // Información del egreso
    doc.setFontSize(12);
    doc.text(`Fecha: ${lastEgreso.fecha}`, 20, 30);
    doc.text(`Secuencial: ${lastEgreso.secuencial}`, 20, 40);
    doc.text(`Tipo: ${lastEgreso.tipo}`, 20, 50);
    doc.text(`Descripción: ${lastEgreso.descripcion}`, 20, 60);
    doc.text(`Monto: ${lastEgreso.monto} ${lastEgreso.moneda}`, 20, 70);
    doc.text(`Unidad: ${lastEgreso.unidad}`, 20, 80);

    // Guardar el PDF con un nombre basado en el secuencial
    doc.save(`Recibo_Egreso_${lastEgreso.secuencial}.pdf`);
  };

  return (
    <div>
      <NavBar handleSignOut={handleSignOut} />
      <div className="egresos-container">
        <h2>Registro de Egresos</h2>
        
        <Form>
          <Form.Group controlId="fechaEgreso">
            <Form.Label>Fecha</Form.Label>
            <Form.Control 
              type="date" 
              value={fecha} 
              onChange={(e) => setFecha(e.target.value)} 
            />
          </Form.Group>

          <Form.Group controlId="tipoEgreso" className="mt-3">
            <Form.Label>Tipo de Egreso</Form.Label>
            <Form.Control 
              as="select" 
              value={tipo} 
              onChange={(e) => setTipo(e.target.value)}
            >
              <option value="">Seleccione</option>
              <option value="Compra">Compra</option>
              <option value="Servicio">Servicio</option>
              <option value="Otro">Otro</option>
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="descripcionEgreso" className="mt-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control 
              type="text" 
              value={descripcion} 
              onChange={(e) => setDescripcion(e.target.value)} 
            />
          </Form.Group>

          <Form.Group controlId="montoEgreso" className="mt-3">
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

          <Button className="mt-4" onClick={handleRegistrarEgreso}>Registrar Egreso</Button>
        </Form>

        <h3 className="mt-5">Lista de Egresos</h3>
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
            {egresos.map((egreso) => (
              <tr key={egreso.id}>
                <td>{egreso.secuencial}</td> {/* Mostrar el secuencial */}
                <td>{egreso.fecha}</td>
                <td>{egreso.tipo}</td>
                <td>{egreso.descripcion}</td>
                <td>{egreso.monto}</td>
                <td>{egreso.moneda}</td>
                <td>{egreso.unidad}</td> {/* Mostrar la unidad registrada */}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Modal para éxito de registro */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Egreso Registrado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          El egreso ha sido registrado exitosamente.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cerrar
          </Button>
          <Button variant="primary" onClick={handleExportPDF}>
            Exportar Recibo como PDF
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Egresos;
