import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './RegistroOperaciones.css';
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
  const [showOperationsList, setShowOperationsList] = useState(false);
  const [showValidateOperations, setShowValidateOperations] = useState(false);
  const [operacion, setOperacion] = useState('');
  const [fechaOperacion, setFechaOperacion] = useState(null);
  const [autorizadoPor, setAutorizadoPor] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [grado, setGrado] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [userRole, setUserRole] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const unidadAutenticada = localStorage.getItem('userUnit');
    const rolAutenticado = localStorage.getItem('userRole');
    if (unidadAutenticada) {
      setUserUnit(unidadAutenticada);
      setUserRole(rolAutenticado);
      cargarUsuarios(unidadAutenticada);
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
        setGrado(foundPersonal.grado || 'Voluntario');
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
        estado: userRole === 'Voluntario' ? 'Pendiente' : 'Aprobado',
      };

      const operacionesActuales = Array.isArray(personalData.operaciones) ? personalData.operaciones : [];

      update(ref(db, `fundacion/personal/${personalData.ci}`), {
        operaciones: [...operacionesActuales, nuevaOperacion],
      }).then(() => {
        setPersonalData((prev) => ({
          ...prev,
          operaciones: [...operacionesActuales, nuevaOperacion],
        }));
        setShowOperationForm(false);
      }).catch((error) => {
        console.error("Error al actualizar la operación:", error);
      });
    } else {
      console.error("No se pudo guardar la operación porque el ID es indefinido.");
    }
  };

  const handleValidateOperation = (index, nuevoEstado) => {
    const db = getDatabase();
    if (personalData && personalData.operaciones) {
      const operacionesActuales = [...personalData.operaciones];
      const operacion = operacionesActuales.filter(op => op.estado === 'Pendiente')[index];
      
      // Cambiar el estado de la operación
      if (operacion) {
        operacion.estado = nuevoEstado;

        update(ref(db, `fundacion/personal/${personalData.ci}`), {
          operaciones: operacionesActuales,
        }).then(() => {
          setPersonalData((prev) => ({
            ...prev,
            operaciones: operacionesActuales,
          }));
        }).catch((error) => {
          console.error("Error al actualizar la operación:", error);
        });
      }
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
                      <strong>Estado:</strong> {personalData.estado || 'N/A'} <br />
                      <strong>Código:</strong> {personalData.codigo || 'N/A'}
                    </Card.Text>
                  </div>
                </Card.Body>
              </Card>

              <div className="registro-operaciones-buttons d-flex justify-content-center mt-4">
                <Button variant="info" className="registro-operaciones-mx-3" onClick={() => setShowOperationForm(true)}>Registrar Operación</Button>
                <Button variant="warning" className="registro-operaciones-mx-3" onClick={() => setShowOperationsList(true)}>Ver Operaciones</Button>
                {userRole !== 'Voluntario' && (
                  <Button variant="primary" className="registro-operaciones-mx-3" onClick={() => setShowValidateOperations(true)}>Validar Operación</Button>
                )}
              </div>

              {showOperationForm && (
                <div className="registro-operaciones-section registro-operaciones-mt-4">
                  <h4 className="registro-operaciones-text-center registro-operaciones-mb-4">Nueva Operación</h4>
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
                        <option value="MatPel">MatPel</option>
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
                      <Form.Control 
                        as="select" 
                        onChange={(e) => {
                          const selectedUser = listaUsuarios.find(usuario => usuario.ci === e.target.value);
                          if (selectedUser) {
                            setAutorizadoPor(`${selectedUser.grado ? selectedUser.grado + ' ' : ''}${selectedUser.nombre} ${selectedUser.apellidoPaterno} ${selectedUser.apellidoMaterno}`);
                          }
                        }}
                      >
                        <option value="">Seleccione...</option>
                        {listaUsuarios.map((usuario) => (
                          <option key={usuario.ci} value={usuario.ci}>
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

              {showOperationsList && (
                <div className="registro-operaciones-section registro-operaciones-mt-4">
                  <h4 className="registro-operaciones-text-center registro-operaciones-mb-4">Operaciones Registradas</h4>
                  {personalData?.operaciones?.length > 0 ? (
                    <div className="operaciones-cards">
                      {personalData.operaciones.map((operacion, index) => (
                        <Card key={index} className="mb-3">
                          <Card.Body>
                            <Card.Title>
                              {format(new Date(operacion.fechaOperacion || operacion.fecha), "dd/MM/yyyy", { locale: es })}
                            </Card.Title>
                            <Card.Text>
                              <strong>Operación:</strong> {operacion.operacion} <br />
                              <strong>Estado:</strong> {operacion.estado || 'N/A'} <br />
                              <strong>Autorizado por:</strong> {operacion.autorizadoPor || 'N/A'} <br />
                              <strong>Observaciones:</strong> {operacion.observaciones || 'N/A'} <br />
                            </Card.Text>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p>No se han registrado operaciones.</p>
                  )}
                </div>
              )}

              {showValidateOperations && userRole !== 'Voluntario' && (
                <div className="registro-operaciones-section registro-operaciones-mt-4">
                  <h4 className="registro-operaciones-text-center registro-operaciones-mb-4">Validar Operaciones Pendientes</h4>
                  {personalData?.operaciones?.filter(op => op.estado === 'Pendiente').length > 0 ? (
                    <div className="operaciones-cards">
                      {personalData.operaciones.filter(op => op.estado === 'Pendiente').map((operacion, index) => (
                        <Card key={index} className="mb-3">
                          <Card.Body>
                            <Card.Title>
                              {format(new Date(operacion.fechaOperacion || operacion.fecha), "dd/MM/yyyy", { locale: es })}
                            </Card.Title>
                            <Card.Text>
                              <strong>Operación:</strong> {operacion.operacion} <br />
                              <strong>Estado:</strong> {operacion.estado || 'N/A'} <br />
                              <strong>Autorizado por:</strong> {operacion.autorizadoPor || 'N/A'} <br />
                              <strong>Observaciones:</strong> {operacion.observaciones || 'N/A'} <br />
                            </Card.Text>
                            <Button variant="success" onClick={() => handleValidateOperation(index, 'Aprobado')}>Aprobar</Button>
                            <Button variant="danger" className="ms-2" onClick={() => handleValidateOperation(index, 'Eliminado')}>Eliminar</Button>
                            <Button variant="warning" className="ms-2" onClick={() => handleValidateOperation(index, 'No Cumple')}>No Cumple</Button>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p>No hay operaciones pendientes de validación.</p>
                  )}
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
