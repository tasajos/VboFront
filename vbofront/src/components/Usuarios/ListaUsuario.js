import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, off, update, remove } from 'firebase/database';
import { getAuth, deleteUser } from 'firebase/auth';
import { Modal, Button } from 'react-bootstrap';
import './ListaUsuario.css'; 
import NavBar from '../NavBar/navbar';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // Usa useNavigate en lugar de Navigate
import { auth } from '../../firebase';


function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const navigate = useNavigate(); // Utiliza useNavigate

  const [formData, setFormData] = useState({
    nombre: '',
    apellidoPaterno: '',
    correo: '',
    unidad: '',
    rol: ''
  });
  const [isSaved, setIsSaved] = useState(false);


  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/signin'); // Redirigir al usuario después de cerrar sesión
      console.log('Sesión cerrada');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

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
    setEditModalIsOpen(true);
  };

  const handleDeleteClick = (usuario) => {
    setUsuarioEditando(usuario);
    setDeleteModalIsOpen(true);
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

  const handleDeleteUser = () => {
    const db = getDatabase();
    const auth = getAuth();
    const usuarioRef = ref(db, `UsuariosVbo/${usuarioEditando.id}`);
    remove(usuarioRef)
      .then(() => {
        const user = auth.currentUser;
        if (user) {
          deleteUser(user)
            .then(() => {
              alert("Usuario eliminado exitosamente.");
            })
            .catch((error) => {
              console.error("Error al eliminar el usuario:", error);
              alert("Error al eliminar el usuario.");
            });
        }
        setDeleteModalIsOpen(false);
      })
      .catch((error) => {
        console.error("Error al eliminar el usuario de la base de datos:", error);
        alert("Error al eliminar el usuario de la base de datos.");
      });
  };

  const closeEditModal = () => {
    setEditModalIsOpen(false);
    setUsuarioEditando(null);
  };

  const closeDeleteModal = () => {
    setDeleteModalIsOpen(false);
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
      <NavBar handleSignOut={handleSignOut} />
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
                  style={{ cursor: 'pointer', color: 'blue', marginRight: '10px' }} 
                />
                <FaTrash 
                  onClick={() => handleDeleteClick(usuario)} 
                  style={{ cursor: 'pointer', color: 'red' }} 
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal show={editModalIsOpen} onHide={closeEditModal}>
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
                  <option value="Fundacion">Fundacion</option>
                  <option value="Voluntario">Voluntario</option>
                  <option value="Seguridad">Seguridad</option>
                  <option value="Bombero">Bombero</option>
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
              <Button variant="secondary" onClick={closeEditModal}>Cancelar</Button>
              <Button variant="primary" onClick={handleSaveChanges}>Guardar</Button>
            </>
          ) : (
            <Button variant="primary" onClick={closeEditModal}>Cerrar</Button>
          )}
        </Modal.Footer>
      </Modal>

      <Modal show={deleteModalIsOpen} onHide={closeDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Eliminar Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de que deseas eliminar a este usuario?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteModal}>Cancelar</Button>
          <Button variant="danger" onClick={handleDeleteUser}>Eliminar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ListaUsuarios;
