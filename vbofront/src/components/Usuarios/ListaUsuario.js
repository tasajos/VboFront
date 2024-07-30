import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, off, update } from 'firebase/database';
import { Modal, Button } from 'react-bootstrap';
import './ListaUsuario.css'; 
import NavBar from '../NavBar/navbar';
import { FaEdit } from 'react-icons/fa';

function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellidoPaterno: '',
    correo: '',
    unidad: '',
    rol: ''
  });
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const db = getDatabase();
    const usuariosRef = ref(db, 'UsuariosVbo');

    const onUsuariosChange = (snapshot) => {
      const usuariosRaw = snapshot.val();
      const usuariosList = usuariosRaw ? Object.keys(usuariosRaw).map(key => ({
        id: key,
        ...usuariosRaw[key]
      })) : [];
      setUsuarios(usuariosList);
    };

    onValue(usuariosRef, onUsuariosChange);
    return () => off(usuariosRef, 'value', onUsuariosChange);
  }, []);

  const handleEditClick = (usuario) => {
    setUsuarioEditando(usuario);
    setFormData({
      nombre: usuario.nombre || '',
      apellidoPaterno: usuario.apellidoPaterno || '',
      correo: usuario.correo || '',
      unidad: usuario.unidad || '',
      rol: usuario.rol || ''
    });
    setIsSaved(false);
    setModalIsOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSaveChanges = () => {
    const db = getDatabase();
    const usuarioRef = ref(db, `UsuariosVbo/${usuarioEditando.id}`);
    update(usuarioRef, formData).then(() => {
      setIsSaved(true);
    });
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setUsuarioEditando(null);
  };

  const usuariosFiltrados = usuarios.filter(usuario =>
    usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    usuario.apellidoPaterno.toLowerCase().includes(busqueda.toLowerCase()) ||
    usuario.correo.toLowerCase().includes(busqueda.toLowerCase()) ||
    usuario.rol.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="tabla-container">
      <NavBar />
      <input
        type="text"
        placeholder="Buscar usuarios..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value.toLowerCase())}
        className="search-input"
      />
      <table className="usuarios-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido Paterno</th>
            <th>Apellido Materno</th>
            <th>Correo Electrónico</th>
            <th>Teléfono</th>
            <th>Unidad</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuariosFiltrados.map((usuario) => (
            <tr key={usuario.id}>
              <td>{usuario.nombre || 'No especificado'}</td>
              <td>{usuario.apellidoPaterno || 'No especificado'}</td>
              <td>{usuario.apellidoMaterno || 'No especificado'}</td>
              <td>{usuario.correo || 'No especificado'}</td>
              <td>{usuario.telefono || 'No especificado'}</td>
              <td>{usuario.unidad || 'No especificado'}</td>
              <td>{usuario.rol || 'No especificado'}</td>
              <td>
                <FaEdit 
                  onClick={() => handleEditClick(usuario)} 
                  style={{ cursor: 'pointer', color: 'blue' }} 
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal show={modalIsOpen} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>{isSaved ? 'Usuario Modificado' : 'Editar Usuario'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!isSaved ? (
            <form>
              <div className="form-group">
                <label>Nombre:</label>
                <input 
                  type="text" 
                  name="nombre" 
                  value={formData.nombre} 
                  onChange={handleInputChange} 
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Apellido Paterno:</label>
                <input 
                  type="text" 
                  name="apellidoPaterno" 
                  value={formData.apellidoPaterno} 
                  onChange={handleInputChange} 
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Correo Electrónico:</label>
                <input 
                  type="email" 
                  name="correo" 
                  value={formData.correo} 
                  onChange={handleInputChange} 
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Unidad:</label>
                <input 
                  type="text" 
                  name="unidad" 
                  value={formData.unidad} 
                  onChange={handleInputChange} 
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Rol:</label>
                <select 
                  name="rol" 
                  value={formData.rol} 
                  onChange={handleInputChange} 
                  className="form-control"
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Coordinador">Coordinador</option>
                  <option value="Voluntario">Voluntario</option>
                  <option value="Seguridad">Seguridad</option>
                  {/* Añade más roles según sea necesario */}
                </select>
              </div>
            </form>
          ) : (
            <p>El usuario ha sido modificado exitosamente.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          {!isSaved ? (
            <>
              <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
              <Button variant="primary" onClick={handleSaveChanges}>Guardar</Button>
            </>
          ) : (
            <Button variant="primary" onClick={closeModal}>Cerrar</Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ListaUsuarios;