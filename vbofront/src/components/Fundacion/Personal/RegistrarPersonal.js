import React, { useState, useEffect } from 'react';
import { getDatabase, ref, set } from 'firebase/database';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import NavBar from '../../NavBar/navbar';
import './RegistrarPersonal.css'; 
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../firebase';

function RegistrarPersonal() {
  const [nombre, setNombre] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [sexo, setSexo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [ci, setCi] = useState('');
  const [exp, setExp] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [tipoSangre, setTipoSangre] = useState('');
  const [correo, setCorreo] = useState('');
  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [unidad, setUnidad] = useState('');
  const [profesion, setProfesion] = useState('');
  const [carrera, setCarrera] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', body: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unidadAutenticada = localStorage.getItem('userUnit');
    setUnidad(unidadAutenticada || '');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (
      !nombre || !apellidoPaterno || !apellidoMaterno || !sexo || !telefono || !ci || !exp || 
      !fechaNacimiento || !tipoSangre || !correo || !direccion || !ciudad || !unidad || 
      !profesion || !carrera
    ) {
      setLoading(false);
      setModalContent({ title: 'Error de Registro', body: 'Por favor, completa todos los campos obligatorios.' });
      setShowModal(true);
      return;
    }

    try {
      const db = getDatabase();
      const personalRef = ref(db, `fundacion/personal/${ci}`);
      await set(personalRef, {
        nombre,
        apellidoPaterno,
        apellidoMaterno,
        sexo,
        telefono,
        ci,
        exp,
        fechaNacimiento,
        tipoSangre,
        correo,
        direccion,
        ciudad,
        unidad,
        profesion,
        carrera,
      });

      setNombre('');
      setApellidoPaterno('');
      setApellidoMaterno('');
      setSexo('');
      setTelefono('');
      setCi('');
      setExp('');
      setFechaNacimiento('');
      setTipoSangre('');
      setCorreo('');
      setDireccion('');
      setCiudad('');
      setUnidad(localStorage.getItem('userUnit') || '');
      setProfesion('');
      setCarrera('');
      setLoading(false);
      setModalContent({ title: 'Registro Exitoso', body: 'El personal ha sido registrado exitosamente.' });
      setShowModal(true);
    } catch (error) {
      let message = 'Ocurrió un error desconocido. Por favor, inténtalo de nuevo.';
      if (error.code === 'database/permission-denied') {
        message = 'No tienes permisos para escribir en la base de datos.';
      }
      setModalContent({ title: 'Error de Registro', body: message });
      setShowModal(true);
      setLoading(false);
    }
  };

  return (
    <div>
      <NavBar handleSignOut={handleSignOut} />
      <div className="personal-background">
        <div className="personal-form-container">
          <h2 className="form-title">Registro de Personal</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre:</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="form-control" required />
            </div>

            <div className="form-group">
              <label>Apellido Paterno:</label>
              <input type="text" value={apellidoPaterno} onChange={(e) => setApellidoPaterno(e.target.value)} className="form-control" required />
            </div>

            <div className="form-group">
              <label>Apellido Materno:</label>
              <input type="text" value={apellidoMaterno} onChange={(e) => setApellidoMaterno(e.target.value)} className="form-control" required />
            </div>

            <div className="form-group">
              <label>Sexo:</label>
              <select value={sexo} onChange={(e) => setSexo(e.target.value)} className="form-control" required>
                <option value="">Seleccione</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>

            <div className="form-group">
              <label>Teléfono:</label>
              <input type="number" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="form-control" required />
            </div>

            <div className="form-group">
              <label>Carnet de Identidad:</label>
              <input type="text" value={ci} onChange={(e) => setCi(e.target.value)} className="form-control" required />
            </div>

            <div className="form-group">
              <label>Expedido en:</label>
              <select value={exp} onChange={(e) => setExp(e.target.value)} className="form-control" required>
                <option value="">Seleccione</option>
                <option value="LP">LP</option>
                <option value="CB">CB</option>
                <option value="SC">SC</option>
                <option value="BE">BE</option>
                <option value="OR">OR</option>
                <option value="PT">PT</option>
                <option value="TJ">TJ</option>
                <option value="CH">CH</option>
                <option value="PD">PD</option>
              </select>
            </div>

            <div className="form-group">
              <label>Fecha de Nacimiento:</label>
              <input type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} className="form-control" required />
            </div>

            <div className="form-group">
              <label>Tipo de Sangre:</label>
              <select value={tipoSangre} onChange={(e) => setTipoSangre(e.target.value)} className="form-control" required>
                <option value="">Seleccione</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="NO SABE">NO SABE</option>
              </select>
            </div>

            <div className="form-group">
              <label>Correo Electrónico:</label>
              <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} className="form-control" required/>
            </div>

            <div className="form-group">
              <label>Dirección:</label>
              <input type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} className="form-control" required />
            </div>

            <div className="form-group">
              <label>Ciudad:</label>
              <select value={ciudad} onChange={(e) => setCiudad(e.target.value)} className="form-control" required>
                <option value="">Seleccione</option>
                <option value="La Paz">La Paz</option>
                <option value="Cochabamba">Cochabamba</option>
                <option value="Santa Cruz">Santa Cruz</option>
                <option value="Beni">Beni</option>
                <option value="Oruro">Oruro</option>
                <option value="Potosí">Potosí</option>
                <option value="Tarija">Tarija</option>
                <option value="Chuquisaca">Chuquisaca</option>
                <option value="Pando">Pando</option>
              </select>
            </div>

            <div className="form-group">
              <label>Unidad:</label>
              <input type="text" value={unidad} className="form-control" readOnly />
            </div>

            <div className="form-group">
              <label>Profesión:</label>
              <select value={profesion} onChange={(e) => setProfesion(e.target.value)} className="form-control" required>
                <option value="">Seleccione</option>
                <option value="Medico">Médico</option>
                <option value="Ingeniero">Ingeniero</option>
                <option value="Abogado">Abogado</option>
                <option value="Profesor">Profesor</option>
                <option value="Enfermero">Enfermero</option>
                <option value="Arquitecto">Arquitecto</option>
                <option value="Estudiante">Estudiante</option>
              </select>
            </div>

            <div className="form-group">
              <label>Carrera:</label>
              <select value={carrera} onChange={(e) => setCarrera(e.target.value)} className="form-control" required>
                <option value="">Seleccione</option>
                <option value="Medicina">Medicina</option>
                <option value="Ingeniería Civil">Ingeniería Civil</option>
                <option value="Ingeniería Sistemas">Ingeniería Sistema</option>
                <option value="Ingeniería Comercial">Ingeniería Comercial</option>
                <option value="Derecho">Derecho</option>
                <option value="Educación">Educación</option>
                <option value="Enfermería">Enfermería</option>
                <option value="Arquitectura">Arquitectura</option>
                <option value="Otros">Otros</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Procesando...' : 'Registrar Personal'}
            </button>
          </form>
          <Modal show={showModal} onHide={() => setShowModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>{modalContent.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="modal-body-content">
                <img src="../img/chlogotrans.png" alt="Success" className="modal-icon" />
                <p>{modalContent.body}</p>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cerrar</Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
}

export default RegistrarPersonal;