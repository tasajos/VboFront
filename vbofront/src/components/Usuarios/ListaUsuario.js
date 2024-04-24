import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import './ListaUsuario.css'; 
import NavBar from '../NavBar/navbar';

function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');

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

  const usuariosFiltrados = usuarios.filter(usuario =>
    usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    usuario.apellidoPaterno.toLowerCase().includes(busqueda.toLowerCase()) ||
    usuario.correo.toLowerCase().includes(busqueda.toLowerCase())||
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ListaUsuarios;
