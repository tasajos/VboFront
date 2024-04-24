import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, set } from 'firebase/database';
import { auth } from '../../firebase';
import './RegistroUsuario.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import NavBar from '../NavBar/navbar';

const RegistroUsuario = () => {
    const [nombre, setNombre] = useState('');
    const [apellidoPaterno, setApellidoPaterno] = useState('');
    const [apellidoMaterno, setApellidoMaterno] = useState('');
    const [carnetIdentidad, setCarnetIdentidad] = useState('');
    const [telefono, setTelefono] = useState('');
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [repetirContrasena, setRepetirContrasena] = useState('');
    const [unidad, setUnidad] = useState('');
    const [rol, setRol] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalBody, setModalBody] = useState('');
    const [loading, setLoading] = useState(false);
  
    const clearFields = () => {
      setNombre('');
      setApellidoPaterno('');
      setApellidoMaterno('');
      setCarnetIdentidad('');
      setTelefono('');
      setCorreo('');
      setContrasena('');
      setRepetirContrasena('');
      setUnidad('');
      setRol('');
    };
  
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (contrasena !== repetirContrasena) {
          setModalTitle('Error de Registro');
          setModalBody('Las contraseñas no coinciden. Por favor, verifica e intenta de nuevo.');
          setShowModal(true);
          return;
        }
        setLoading(true);
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, correo, contrasena);
          const db = getDatabase();
          await set(ref(db, 'UsuariosVbo/' + userCredential.user.uid), {
            nombre,
            apellidoPaterno,
            apellidoMaterno,
            carnetIdentidad,
            telefono,
            correo,
            unidad,
            rol
          });
          setModalTitle('Registro Exitoso');
          setModalBody('¡Felicidades! Has sido registrado exitosamente.');
          clearFields();
          setShowModal(true);
        } catch (error) {
          let errorMessage = 'Se ha producido un error inesperado. Por favor, intenta de nuevo más tarde.';
          if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'El correo electrónico ya está en uso. Por favor, utiliza otro correo o recupera tu contraseña si olvidaste la anterior.';
          }
          setModalTitle('Error de Registro');
          setModalBody(errorMessage);
          setShowModal(true);
        } finally {
          setLoading(false);
        }
      };
  
    return (
      <div>
        <NavBar />
        <div className="container mt-5">
          <h2>Registro de Usuario</h2>
          <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="nombre" className="form-label">Nombre:</label>
            <input type="text" className="form-control" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label htmlFor="apellidoPaterno" className="form-label">Apellido Paterno:</label>
            <input type="text" className="form-control" id="apellidoPaterno" value={apellidoPaterno} onChange={(e) => setApellidoPaterno(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label htmlFor="apellidoMaterno" className="form-label">Apellido Materno:</label>
            <input type="text" className="form-control" id="apellidoMaterno" value={apellidoMaterno} onChange={(e) => setApellidoMaterno(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label htmlFor="carnetIdentidad" className="form-label">Carnet de Identidad:</label>
            <input type="text" className="form-control" id="carnetIdentidad" value={carnetIdentidad} onChange={(e) => setCarnetIdentidad(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label htmlFor="telefono" className="form-label">Teléfono:</label>
            <input type="text" className="form-control" id="telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label htmlFor="correo" className="form-label">Correo Electrónico:</label>
            <input type="email" className="form-control" id="correo" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label htmlFor="contrasena" className="form-label">Contraseña:</label>
            <input type="password" className="form-control" id="contrasena" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label htmlFor="repetirContrasena" className="form-label">Repetir Contraseña:</label>
            <input type="password" className="form-control" id="repetirContrasena" value={repetirContrasena} onChange={(e) => setRepetirContrasena(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label htmlFor="unidad" className="form-label">Unidad a la que pertenece:</label>
            <input type="text" className="form-control" id="unidad" value={unidad} onChange={(e) => setUnidad(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label htmlFor="rol" className="form-label">Rol:</label>
            <select className="form-control" id="rol" value={rol} onChange={(e) => setRol(e.target.value)} required>
              <option value="">Seleccione un rol</option>
              <option value="Administrador">Administrador</option>
              <option value="Coordinador">Coordinador</option>
              <option value="Voluntario">Voluntario</option>
              <option value="Tecnico">Técnico</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary w-100 mt-4">
            {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : "Registrarse"}
          </button>
          </form>
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>{modalTitle}</Modal.Title>
          </Modal.Header>
          <Modal.Body>{modalBody}</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default RegistroUsuario;
