import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './SeguimientoPersonal.css';
import NavBar from '../../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../firebase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function SeguimientoPersonal() {
  const [ci, setCi] = useState('');
  const [personalData, setPersonalData] = useState(null);
  const [error, setError] = useState('');
  const [userUnit, setUserUnit] = useState('');
  const [showEstadoModal, setShowEstadoModal] = useState(false);
  const [showHistorial, setShowHistorial] = useState(false);
  const [showDocumentacionModal, setShowDocumentacionModal] = useState(false);
  const [showCodigoModal, setShowCodigoModal] = useState(false);
  const [showReconocimientoModal, setShowReconocimientoModal] = useState(false);
  const [estado, setEstado] = useState('');
  const [permiso, setPermiso] = useState('');
  const [motivo, setMotivo] = useState('');
  const [fechaPermiso, setFechaPermiso] = useState([null, null]);
  const [historial, setHistorial] = useState([]);
  const [documentacion, setDocumentacion] = useState({
    CI: false,
    Croquis: false,
    Compromiso: false
  });
  const [codigo, setCodigo] = useState('');
  const [codigoAsignado, setCodigoAsignado] = useState(false);
  const [mensajeGuardado, setMensajeGuardado] = useState('');

  const [tipoReconocimiento, setTipoReconocimiento] = useState('');
  const [institucion, setInstitucion] = useState('');
  const [fechaReconocimiento, setFechaReconocimiento] = useState(null);
  const [anioReconocimiento, setAnioReconocimiento] = useState('');
  const [tipoMemo, setTipoMemo] = useState('');
  const [autorizadoPor, setAutorizadoPor] = useState('');
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [grado, setGrado] = useState('');

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
      const foundPersonal = personalData ? Object.values(personalData).find(personal => personal.ci === ci) : null;

      if (foundPersonal) {
        if (foundPersonal.unidad === userUnit) {
          setPersonalData(foundPersonal);
          setHistorial(foundPersonal.historial || []);
          setDocumentacion({
            CI: foundPersonal.documentacion?.CI || false,
            Croquis: foundPersonal.documentacion?.Croquis || false,
            Compromiso: foundPersonal.documentacion?.Compromiso || false,
          });
          setCodigo(foundPersonal.codigo || '');
          setCodigoAsignado(!!foundPersonal.codigo);
          setError('');
        } else {
          setPersonalData(null);
          setError('El voluntario no pertenece a tu unidad.');
        }
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

  const handleSaveEstado = () => {
    const db = getDatabase();
    if (personalData && personalData.ci) {
      const nuevoHistorial = {
        fecha: new Date().toISOString(),
        estado,
        permiso: estado === 'Permiso' ? permiso : null,
        fechaPermiso: estado === 'Permiso' ? fechaPermiso : null,
        motivo,
      };

      update(ref(db, `fundacion/personal/${personalData.ci}`), {
        estado,
        historial: [...historial, nuevoHistorial],
      }).then(() => {
        setPersonalData((prev) => ({ ...prev, estado, historial: [...historial, nuevoHistorial] }));
        setShowEstadoModal(false);
      }).catch((error) => {
        console.error("Error updating estado:", error);
      });
    } else {
      console.error("No se pudo guardar el estado porque el ID es indefinido.");
    }
  };

  const handleSaveDocumentacion = () => {
    const db = getDatabase();
    if (personalData && personalData.ci) {
      update(ref(db, `fundacion/personal/${personalData.ci}`), {
        documentacion,
      }).then(() => {
        setPersonalData((prev) => ({ ...prev, documentacion }));
        setShowDocumentacionModal(false);
      }).catch((error) => {
        console.error("Error updating documentacion:", error);
      });
    } else {
      console.error("No se pudo guardar la documentación porque el ID es indefinido.");
    }
  };

  const handleSaveCodigo = () => {
    const db = getDatabase();
    if (personalData && personalData.ci) {
      update(ref(db, `fundacion/personal/${personalData.ci}`), {
        codigo,
      }).then(() => {
        setMensajeGuardado('Código guardado exitosamente.');
        setTimeout(() => {
          setMensajeGuardado('');
          setShowCodigoModal(false);
        }, 2000);
      }).catch((error) => {
        console.error("Error updating codigo:", error);
      });
    } else {
      console.error("No se pudo guardar el código porque el ID es indefinido.");
    }
  };

  const handleSaveReconocimiento = () => {
    const db = getDatabase();
    const autorizadoUsuario = listaUsuarios.find(usuario => usuario.ci === autorizadoPor);

    //const autorizadoUsuario = listaUsuarios.find(usuario => usuario.ci === autorizadoPor);


    if (personalData && personalData.ci && autorizadoUsuario) {
        const nuevoHistorial = {
            fecha: new Date().toISOString(),
            tipoReconocimiento,
            institucion,
            fechaReconocimiento,
            anioReconocimiento,
            tipoMemo: tipoReconocimiento === 'memorandum' ? tipoMemo : null,
            grado: tipoMemo === 'Ascenso' ? grado : null, // Guardar el grado solo si es ascenso
            motivo,
            autorizadoPor: `${autorizadoUsuario.grado} ${autorizadoUsuario.nombre} ${autorizadoUsuario.apellidoPaterno} ${autorizadoUsuario.apellidoMaterno}`,
        };

        const updates = {
            historial: [...historial, nuevoHistorial],
        };

        // Si es un ascenso, actualizar el grado fuera del historial también
        if (tipoMemo === 'Ascenso') {
            updates.grado = grado;
        }

        update(ref(db, `fundacion/personal/${personalData.ci}`), updates)
            .then(() => {
                setPersonalData((prev) => ({
                    ...prev,
                    historial: [...historial, nuevoHistorial],
                    grado: tipoMemo === 'Ascenso' ? grado : prev.grado, // Actualizar el grado en personalData
                }));
                setShowReconocimientoModal(false);
                setMensajeGuardado('Reconocimiento guardado exitosamente.');
                setTimeout(() => {
                    setMensajeGuardado('');
                }, 2000);
            })
            .catch((error) => {
                console.error("Error updating reconocimiento:", error);
            });
    } else {
        console.error("No se pudo guardar el reconocimiento porque el ID es indefinido o no se encontró al usuario autorizado.");
    }
};

  const toggleHistorial = () => {
    setShowHistorial(!showHistorial);
  };

  const gradoActual = historial.find(entry => entry.grado)?.grado;

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
            <>
              <Card className="personal-card mx-auto">
                <Card.Body className="d-flex align-items-center">
                  <div className="card-left">
                    <Card.Img
                      variant="top"
                      src="https://via.placeholder.com/150"
                      className="profile-image"
                    />
                    <div className="name-section">
                      <h4 className="name-text">{personalData.nombre} {personalData.apellidoPaterno} {personalData.apellidoMaterno}</h4>
                      <h6 className="role-text">{personalData.grado || 'Voluntario'}</h6>
                    </div>
                  </div>
                  <div className="card-right">
                    <Card.Text className="card-text">
                      <strong>CI:</strong> {personalData.ci} <br />
                      <strong>Tipo de Sangre:</strong> {personalData.tipoSangre || 'N/A'} <br />
                      <strong>E-mail:</strong> {personalData.correo} <br />
                      <strong>Teléfono:</strong> {personalData.telefono} <br />
                      <strong>Dirección:</strong> {personalData.direccion} <br />
                      <strong>Ciudad:</strong> {personalData.ciudad} <br />
                      <strong>Unidad:</strong> {personalData.unidad} <br />
                      <strong>Estado:</strong> {personalData.estado || 'N/A'}<br />
                      <strong>Codigo:</strong> {personalData.codigo || 'N/A'}
                    </Card.Text>
                  </div>
                </Card.Body>
              </Card>

              <div className="mt-4 d-flex justify-content-center">
                <Button variant="warning" className="mr-2 mx-3" onClick={() => setShowEstadoModal(true)}>Gestión Estado</Button>
                <Button variant="info" className="mr-2 mx-3" onClick={toggleHistorial}>Ver Historial</Button>
                <Button variant="warning" className="mx-3" onClick={() => setShowDocumentacionModal(true)}>Gestión Documentación</Button>
                <Button variant="warning" className="mx-3" onClick={() => setShowCodigoModal(true)}>Gestión Código</Button>
                <Button variant="info" className="mx-3" onClick={() => setShowReconocimientoModal(true)}>Reconocimientos</Button>
              </div>

              {showHistorial && (
                <div className="mt-4">
                  <h4 className="text-center mb-4">Historial</h4>
                  {historial.length > 0 ? (
                    <div className="historial-cards">
                      {historial.map((entry, index) => (
                        <Card key={index} className="mb-3">
                          <Card.Body>
                            <Card.Title>
                              {format(new Date(entry.fecha), "dd/MM/yyyy HH:mm", { locale: es })}
                            </Card.Title>
                            <Card.Text>
  <strong>Estado:</strong> {personalData.estado} <br />
  <strong>Grado:</strong> {entry.grado} <br />
  {entry.permiso && (
    <>
      <strong>Permiso:</strong> {entry.permiso} <br />
      <strong>Fechas del Permiso:</strong> 
      {entry.fechaPermiso ? `${format(new Date(entry.fechaPermiso[0]), "dd/MM/yyyy")} - ${format(new Date(entry.fechaPermiso[1]), "dd/MM/yyyy")}` : 'N/A'} 
      <br />
    </>
  )}
  <strong>Motivo:</strong> {entry.motivo || 'N/A'}<br />
  {entry.tipoReconocimiento && (
    <>
      <strong>Reconocimiento:</strong> {entry.tipoReconocimiento} <br />
      <strong>Institución:</strong> {entry.institucion || 'N/A'} <br />
      <strong>Fecha:</strong> {entry.fechaReconocimiento ? format(new Date(entry.fechaReconocimiento), "dd/MM/yyyy") : 'N/A'} <br />
      <strong>Año:</strong> {entry.anioReconocimiento || 'N/A'} <br />
      {entry.tipoMemo && (
        <>
          <strong>Tipo de Memorandum:</strong> {entry.tipoMemo} <br />
          <strong>Autorizado por:</strong> 
          {personalData.grado ? `${personalData.grado} ` : ''} 
          {entry.autorizadoPor || 'N/A'}   {entry.apellidoPaterno || ''} {entry.apellidoMaterno || ''} <br />
        </>
      )}
    </>
  )}
                            </Card.Text>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p>No tiene historial.</p>
                  )}
                </div>
              )}

              {/* Modal para Gestión de Código */}
              <Modal show={showCodigoModal} onHide={() => setShowCodigoModal(false)} centered>
                <Modal.Header closeButton>
                  <Modal.Title>Gestión de Código</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {codigoAsignado ? (
                    <>
                      <p>El código asignado es: <strong>{codigo}</strong></p>
                      <Form.Group controlId="formCodigo" className="mt-3">
                        <Form.Label>Editar Código:</Form.Label>
                        <Form.Control
                          type="text"
                          value={codigo}
                          onChange={(e) => setCodigo(e.target.value)}
                          placeholder="Ingresa un nuevo código"
                        />
                      </Form.Group>
                    </>
                  ) : (
                    <div>
                      <p>¿Deseas asignar un código a este registro?</p>
                      <Button variant="primary" onClick={() => setCodigoAsignado(true)}>
                        Asignar Código
                      </Button>
                    </div>
                  )}
                </Modal.Body>
                <Modal.Footer>
                  {codigoAsignado && (
                    <>
                      <Button variant="secondary" onClick={() => setShowCodigoModal(false)}>Cancelar</Button>
                      <Button variant="primary" onClick={handleSaveCodigo}>Guardar</Button>
                    </>
                  )}
                </Modal.Footer>
              </Modal>

              {/* Modal para Gestión de Reconocimientos */}
              <Modal show={showReconocimientoModal} onHide={() => setShowReconocimientoModal(false)} centered>
                <Modal.Header closeButton>
                  <Modal.Title>Reconocimientos</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form.Group controlId="formTipoReconocimiento">
                    <Form.Label>Seleccione:</Form.Label>
                    <Form.Control as="select" value={tipoReconocimiento} onChange={(e) => setTipoReconocimiento(e.target.value)}>
                      <option value="">Seleccione...</option>
                      <option value="reconocimiento">Reconocimiento</option>
                      <option value="memorandum">Memorandum</option>
                      <option value="llamada">Llamada de Atención</option>
                    </Form.Control>
                  </Form.Group>

                  <Form.Group controlId="formInstitucion" className="mt-3">
                    <Form.Label>Institución:</Form.Label>
                    <Form.Control
                      type="text"
                      value={institucion}
                      onChange={(e) => setInstitucion(e.target.value)}
                      placeholder="Nombre de la institución"
                    />
                  </Form.Group>

                  <Form.Group controlId="formFechaReconocimiento" className="mt-3">
                    <Form.Label>Fecha:</Form.Label>
                    <DatePicker
                      selected={fechaReconocimiento}
                      onChange={(date) => setFechaReconocimiento(date)}
                      dateFormat="dd/MM/yyyy"
                      className="form-control"
                    />
                  </Form.Group>

                  <Form.Group controlId="formAnioReconocimiento" className="mt-3">
                    <Form.Label>Año:</Form.Label>
                    <Form.Control
                      type="text"
                      value={anioReconocimiento}
                      onChange={(e) => setAnioReconocimiento(e.target.value)}
                      placeholder="Ingrese el año"
                    />
                  </Form.Group>

                  <Form.Group controlId="formMotivo" className="mt-3">
                    <Form.Label>Motivo:</Form.Label>
                    <Form.Control
                      type="text"
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      placeholder="Describe el motivo"
                    />
                  </Form.Group>

                  {tipoReconocimiento === 'memorandum' && (
                    <>
                      <Form.Group controlId="formTipoMemo" className="mt-3">
                        <Form.Label>Seleccione:</Form.Label>
                        <Form.Control as="select" value={tipoMemo} onChange={(e) => setTipoMemo(e.target.value)}>
                          <option value="">Seleccione...</option>
                          <option value="Ascenso">Ascenso</option>
                          <option value="suspension">Suspensión</option>
                          <option value="mision">Misión</option>
                          <option value="Designacion">Designacion</option>
                        </Form.Control>
                      </Form.Group>

                      {tipoMemo === 'Ascenso' && (
                        <Form.Group controlId="formGrado" className="mt-3">
                          <Form.Label>Grado:</Form.Label>
                          <Form.Control as="select" value={grado} onChange={(e) => setGrado(e.target.value)}>
                            <option value="">Seleccione...</option>
                            <option value="Vol.Inicial">Vol.Inicial</option>
                            <option value="Vol.2do">Vol.2do</option>
                            <option value="Vol.1ro">Vol.1ro</option>
                            <option value="Especialista">Especialista</option>
                            <option value="Tte.2do">Tte.2do</option>
                            <option value="Tte.1ro">Tte.1ro</option>
                            <option value="Capitan">Capitan</option>
                            <option value="Cap.Director">Cap.Director</option>
                            <option value="Comodoro">Comodoro</option>
                            <option value="Comodoro Brigadier">Comodoro Brigadier</option>
                            <option value="Comodoro Comando">Comodoro Comando</option>
                          </Form.Control>
                        </Form.Group>
                      )}

<Form.Group controlId="formAutorizadoPor" className="mt-3">
    <Form.Label>Autorizado por:</Form.Label>
    <Form.Control as="select" value={autorizadoPor} onChange={(e) => setAutorizadoPor(e.target.value)}>
        <option value="">Seleccione...</option>
        {listaUsuarios.map((usuario) => (
            <option key={usuario.ci} value={usuario.ci}>
             {usuario.grado}  {usuario.nombre} {usuario.apellidoPaterno} {usuario.apellidoMaterno}
            </option>
        ))}
    </Form.Control>
</Form.Group>
                    </>
                  )}
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => setShowReconocimientoModal(false)}>Cancelar</Button>
                  <Button variant="primary" onClick={handleSaveReconocimiento}>Guardar</Button>
                </Modal.Footer>
              </Modal>

              {mensajeGuardado && <p className="text-center text-success">{mensajeGuardado}</p>}
            </>
          )}

          {/* Modal para Gestión de Estado */}
          <Modal show={showEstadoModal} onHide={() => setShowEstadoModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Gestión de Estado</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group controlId="formEstado">
                <Form.Label>Selecciona el Estado:</Form.Label>
                <Form.Control as="select" value={estado} onChange={(e) => setEstado(e.target.value)}>
                  <option value="">Seleccione...</option>
                  <option value="Activo">Activo</option>
                  <option value="Pasivo">Pasivo</option>
                  <option value="Cooperador">Cooperador</option>
                  <option value="Baja">Baja</option>
                  <option value="Suspendido">Suspendido</option>
                  <option value="Permiso">Permiso</option>
                </Form.Control>
              </Form.Group>

              {estado === 'Permiso' && (
                <>
                  <Form.Group controlId="formPermiso" className="mt-3">
                    <Form.Label>Selecciona el Permiso:</Form.Label>
                    <Form.Control as="select" value={permiso} onChange={(e) => setPermiso(e.target.value)}>
                      <option value="">Seleccione...</option>
                      <option value="Estudio">Estudio</option>
                      <option value="Trabajo">Trabajo</option>
                      <option value="Familiar">Familiar</option>
                      <option value="Otros">Otros</option>
                    </Form.Control>
                  </Form.Group>

                  <Form.Group controlId="formFechaPermiso" className="mt-3">
                    <Form.Label>Selecciona el Rango de Fechas:</Form.Label>
                    <DatePicker
                      selected={fechaPermiso[0]}
                      onChange={(dates) => setFechaPermiso(dates)}
                      startDate={fechaPermiso[0]}
                      endDate={fechaPermiso[1]}
                      selectsRange
                      inline
                    />
                  </Form.Group>
                </>
              )}

              <Form.Group controlId="formMotivo" className="mt-3">
                <Form.Label>Motivo:</Form.Label>
                <Form.Control
                  type="text"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Describe el motivo"
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowEstadoModal(false)}>Cancelar</Button>
              <Button variant="primary" onClick={handleSaveEstado}>Guardar</Button>
            </Modal.Footer>
          </Modal>

          {/* Modal para Gestión de Documentación */}
          <Modal show={showDocumentacionModal} onHide={() => setShowDocumentacionModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Gestión de Documentación</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Check
                type="checkbox"
                label="CI"
                checked={documentacion.CI}
                onChange={(e) => setDocumentacion({ ...documentacion, CI: e.target.checked })}
              />
              <Form.Check
                type="checkbox"
                label="Croquis"
                checked={documentacion.Croquis}
                onChange={(e) => setDocumentacion({ ...documentacion, Croquis: e.target.checked })}
              />
              <Form.Check
                type="checkbox"
                label="Compromiso"
                checked={documentacion.Compromiso}
                onChange={(e) => setDocumentacion({ ...documentacion, Compromiso: e.target.checked })}
              />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowDocumentacionModal(false)}>Cancelar</Button>
              <Button variant="primary" onClick={handleSaveDocumentacion}>Guardar</Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
}

export default SeguimientoPersonal;