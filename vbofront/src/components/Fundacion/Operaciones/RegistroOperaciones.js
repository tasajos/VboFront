import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './RegistroOperaciones.css';  // Asegúrate de cambiar la ruta si es necesario
import NavBar from '../../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../firebase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function RegistroOperaciones() {
  const [ciOrCode, setCiOrCode] = useState('');
  const [personalData, setPersonalData] = useState(null);
  const [error, setError] = useState('');
  const [userUnit, setUserUnit] = useState('');
  const [showOperationForm, setShowOperationForm] = useState(false);
  const [operacion, setOperacion] = useState('');
  const [fechaOperacion, setFechaOperacion] = useState(null);
  const [autorizadoPor, setAutorizadoPor] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [grado, setGrado] = useState('');
  const [historial, setHistorial] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const unidadAutenticada = localStorage.getItem('userUnit');
    if (unidadAutenticada) {
      setUserUnit(unidadAutenticada);
      cargarUsuarios(unidadAutenticada); // Cargar los usuarios de la misma unidad
    }
  }, []);

  const cargarUsuarios = (unidad) => {
    const db = getDatabase();
    const usuariosRef = ref(db, 'fundacion/personal');
    onValue(usuariosRef, (snapshot) => {
      const usuarios = snapshot.val();
      const usuariosDeUnidad = usuarios
        ? Object.values(usuarios).filter((usuario) => usuario.unidad === unidad)
        : [];
      setListaUsuarios(usuariosDeUnidad);
    });
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

  const handleSearch = () => {
    const db = getDatabase();
    const personalRef = ref(db, 'fundacion/personal');

    onValue(personalRef, (snapshot) => {
      const personalData = snapshot.val();
      const foundPersonal = personalData 
        ? Object.values(personalData).find(personal => 
            (personal.ci === ciOrCode || personal.codigo === ciOrCode) && personal.unidad === userUnit) 
        : null;

      if (foundPersonal) {
        setPersonalData(foundPersonal);
        setHistorial(foundPersonal.historial || []);
        setError('');
      } else {
        setPersonalData(null);
        setError('No se encontró un registro con ese carnet de identidad o código.');
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  const handleSaveOperation = () => {
    const db = getDatabase();
    if (personalData && personalData.ci) {
      const nuevaOperacion = {
        fecha: new Date().toISOString(),
        operacion,
        fechaOperacion: fechaOperacion ? fechaOperacion.toISOString() : null,
        autorizadoPor,
        observaciones,
      };

      update(ref(db, `fundacion/personal/${personalData.ci}/operaciones`), {
        operaciones: [...(personalData.operaciones || []), nuevaOperacion],
      }).then(() => {
        setPersonalData((prev) => ({ ...prev, operaciones: [...(prev.operaciones || []), nuevaOperacion] }));
        setShowOperationForm(false);
      }).catch((error) => {
        console.error("Error updating operacion:", error);
      });
    } else {
      console.error("No se pudo guardar la operación porque el ID es indefinido.");
    }
  };

  const gradoActual = historial.find(entry => entry.grado)?.grado || personalData?.grado || 'Voluntario';

  return (
    <div>
      <NavBar handleSignOut={handleSignOut} />
      <div className="registro-operaciones-container">
        <div className="registro-operaciones-wrapper">
          <h2 className="registro-operaciones-text-center registro-operaciones-mb-4">Registro de Operaciones</h2>
          <Form className="registro-operaciones-search-form" onSubmit={handleSubmit}>
            <Form.Control
              type="text"
              placeholder="Buscar por carnet de identidad o código"
              className="registro-operaciones-search-input"
              value={ciOrCode}
              onChange={(e) => setCiOrCode(e.target.value)}
            />
            <Button variant="primary" type="submit" className="registro-operaciones-search-button">
              Buscar
            </Button>
          </Form>

          {error && <p className="registro-operaciones-text-center registro-operaciones-error-message">{error}</p>}

          {personalData && (
            <>
            <Card className="registro-operaciones-card mx-auto">
    <Card.Body className="d-flex align-items-center">
        <div className="registro-operaciones-card-left">
            <Card.Img
                variant="top"
                src="https://via.placeholder.com/150"
                className="registro-operaciones-profile-image"
            />
            <div className="registro-operaciones-name-section">
                <h4 className="registro-operaciones-name-text">{personalData.nombre} {personalData.apellidoPaterno} {personalData.apellidoMaterno}</h4>
                <h6 className="registro-operaciones-role-text">{gradoActual}</h6>
            </div>
        </div>
        <div className="registro-operaciones-card-right">
        <Card.Text className="registro-operaciones-card-text">
    <strong>CI:</strong> {personalData.ci} <br />
    <strong>Tipo de Sangre:</strong> {personalData.tipoSangre || 'N/A'} <br />
    <strong>E-mail:</strong> {personalData.correo} <br />
    <strong>Teléfono:</strong> {personalData.telefono} <br />
    <strong>Dirección:</strong> {personalData.direccion} <br />
    <strong>Ciudad:</strong> {personalData.ciudad} <br />
    <strong>Unidad:</strong> {personalData.unidad} <br />
    <strong>Estado:</strong> {personalData.estado || 'N/A'}
</Card.Text>
        </div>
    </Card.Body>
</Card>

              <div className="registro-operaciones-mt-4 d-flex justify-content-center">
                <Button variant="info" className="registro-operaciones-mx-3" onClick={() => setShowOperationForm(true)}>Registrar Operación</Button>
              </div>

              {showOperationForm && (
                <div className="registro-operaciones-mt-4">
                    <br></br>
                  <h4 className="registro-operaciones-text-center registro-operaciones-mb-4"></h4>
                  <Form>
                    <Form.Group controlId="formOperacion">
                      <Form.Label>Operación:</Form.Label>
                      <Form.Control as="select" value={operacion} onChange={(e) => setOperacion(e.target.value)}>
                        <option value="">Seleccione...</option>
                        <option value="Rescate Animal">Rescate Animal</option>
                        <option value="Busqueda y Rescate">Búsqueda y Rescate</option>
                        <option value="Apoyo">Apoyo</option>
                        <option value="Incendio Forestal">Incendio Forestal</option>
                        <option value="Incendio Estructural">Incendio Estructural</option>
                        <option value="Mision">Misión</option>
                        <option value="Rescate Acuatico">Rescate Acuático</option>
                        <option value="Deslave">Deslave</option>
                        <option value="Desastre">Desastre</option>
                        <option value="Otros">Otros</option>
                      </Form.Control>
                    </Form.Group>

                    <Form.Group controlId="formFechaOperacion" className="registro-operaciones-mt-3">
                      <Form.Label>Fecha:</Form.Label>
                      <DatePicker
                        selected={fechaOperacion}
                        onChange={(date) => setFechaOperacion(date)}
                        dateFormat="dd/MM/yyyy"
                        className="form-control"
                      />
                    </Form.Group>

                    <Form.Group controlId="formAutorizadoPor" className="registro-operaciones-mt-3">
                      <Form.Label>Autorizado por:</Form.Label>
                      <Form.Control as="select" value={autorizadoPor} onChange={(e) => setAutorizadoPor(e.target.value)}>
                        <option value="">Seleccione...</option>
                        {listaUsuarios.map((usuario) => (
                          <option key={usuario.ci} value={usuario.nombre}>
                            {usuario.grado ? `${usuario.grado} ` : ''}{usuario.nombre} {usuario.apellidoPaterno} {usuario.apellidoMaterno}
                          </option>
                        ))}
                      </Form.Control>
                    </Form.Group>

                    <Form.Group controlId="formObservaciones" className="registro-operaciones-mt-3">
                      <Form.Label>Observaciones:</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        placeholder="Ingrese observaciones"
                      />
                    </Form.Group>

                    <Button variant="primary" className="registro-operaciones-mt-3" onClick={handleSaveOperation}>
                      Guardar Operación
                    </Button>
                  </Form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default RegistroOperaciones;

