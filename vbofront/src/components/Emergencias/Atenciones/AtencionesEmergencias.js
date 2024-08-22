import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, off, update } from 'firebase/database';
import './TablaEmergencias.css'; 
import NavBar from '../../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // Usa useNavigate en lugar de Navigate
import { auth } from '../../../firebase';

function TablaEmergencias() {
  const [emergenciasActivas, setEmergenciasActivas] = useState([]);
  const [emergenciasControladas, setEmergenciasControladas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [ordenColumna, setOrdenColumna] = useState('');
  const [ordenDireccion, setOrdenDireccion] = useState('asc');
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate(); // Utiliza useNavigate

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
    const emergenciasRef = ref(db, 'ultimasEmergencias');

    const onEmergenciasChange = (snapshot) => {
      const emergenciasRaw = snapshot.val();
      const emergenciasList = emergenciasRaw ? Object.keys(emergenciasRaw).map(key => ({
        id: key,
        ...emergenciasRaw[key]
      })) : [];
      
      // Filtrar emergencias activas y controladas
      setEmergenciasActivas(emergenciasList.filter(emergencia => emergencia.estado === 'Activo'));
      setEmergenciasControladas(emergenciasList.filter(emergencia => emergencia.estado === 'Controlado'));
    };

    onValue(emergenciasRef, onEmergenciasChange);
    return () => off(emergenciasRef, 'value', onEmergenciasChange);
  }, []);

  const handleActualizarEstado = (id, nuevoEstado) => {
    const db = getDatabase();
    const emergenciaRef = ref(db, `ultimasEmergencias/${id}`);

    update(emergenciaRef, { estado: nuevoEstado })
      .then(() => {
        setMensaje('Estado actualizado correctamente.');
        setTimeout(() => setMensaje(''), 3000);
        window.location.reload(); // Recargar la página para reflejar los cambios
      })
      .catch(error => {
        console.error("Error al actualizar el estado:", error);
        setMensaje('Error al actualizar el estado.');
        setTimeout(() => setMensaje(''), 3000);
      });
  };

  const handleOrdenar = (columna) => {
    const nuevaDireccion = ordenColumna === columna && ordenDireccion === 'asc' ? 'desc' : 'asc';
    setOrdenColumna(columna);
    setOrdenDireccion(nuevaDireccion);
  };

  const filtrarEmergencias = (emergencias) => {
    return emergencias.filter(emergencia =>
      (emergencia.Titulo && emergencia.Titulo.toLowerCase().includes(busqueda.toLowerCase())) ||
      (emergencia.ciudad && emergencia.ciudad.toLowerCase().includes(busqueda.toLowerCase())) ||
      (emergencia.descripcion && emergencia.descripcion.toLowerCase().includes(busqueda.toLowerCase())) ||
      (emergencia.tipo && emergencia.tipo.toLowerCase().includes(busqueda.toLowerCase()))
    );
  };

  return (
    <div>
       <NavBar handleSignOut={handleSignOut} />
    <br></br>
    <div className="tabla-container">
     
      {mensaje && <div className="alert">{mensaje}</div>}
      <input
        type="text"
        placeholder="Buscar emergencias..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value.toLowerCase())}
        className="search-input"
      />

      {/* Tabla de emergencias activas */}
      <div style={{ marginBottom: '40px' }}>
        <h2>Emergencias Activas</h2>
        <table className="emergencias-table">
          <thead>
            <tr>
              <th onClick={() => handleOrdenar('Titulo')}>Título</th>
              <th onClick={() => handleOrdenar('ciudad')}>Ciudad</th>
              <th onClick={() => handleOrdenar('descripcion')}>Descripción</th>
              <th onClick={() => handleOrdenar('tipo')}>Tipo</th>
              <th>Estado</th>
              <th onClick={() => handleOrdenar('fecha')}>Fecha</th>
              <th onClick={() => handleOrdenar('hora')}>Hora</th>
            </tr>
          </thead>
          <tbody>
            {filtrarEmergencias(emergenciasActivas).map((emergencia) => (
              <tr key={emergencia.id}>
                <td>{emergencia.Titulo || 'No especificado'}</td>
                <td>{emergencia.ciudad || 'No especificado'}</td>
                <td>{emergencia.descripcion || 'No especificado'}</td>
                <td>{emergencia.tipo || 'No especificado'}</td>
                <td>
                  <select
                    value={emergencia.estado}
                    onChange={(e) => handleActualizarEstado(emergencia.id, e.target.value)}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Atendido">Atendido</option>
                    <option value="Controlado">Controlado</option>
                    <option value="Vencido">Vencido</option>
                  </select>
                </td>
                <td>{emergencia.fecha || 'No especificado'}</td>
                <td>{emergencia.hora || 'No especificado'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Nueva tabla de emergencias controladas */}
      <div style={{ marginBottom: '40px' }}>
        <h2>Emergencias Controladas</h2>
        <table className="emergencias-table">
          <thead>
            <tr>
              <th onClick={() => handleOrdenar('Titulo')}>Título</th>
              <th onClick={() => handleOrdenar('ciudad')}>Ciudad</th>
              <th onClick={() => handleOrdenar('descripcion')}>Descripción</th>
              <th onClick={() => handleOrdenar('tipo')}>Tipo</th>
              <th>Estado</th>
              <th onClick={() => handleOrdenar('fecha')}>Fecha</th>
              <th onClick={() => handleOrdenar('hora')}>Hora</th>
            </tr>
          </thead>
          <tbody>
            {filtrarEmergencias(emergenciasControladas).map((emergencia) => (
              <tr key={emergencia.id}>
                <td>{emergencia.Titulo || 'No especificado'}</td>
                <td>{emergencia.ciudad || 'No especificado'}</td>
                <td>{emergencia.descripcion || 'No especificado'}</td>
                <td>{emergencia.tipo || 'No especificado'}</td>
                <td>
                  <select
                    value={emergencia.estado}
                    onChange={(e) => handleActualizarEstado(emergencia.id, e.target.value)}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Atendido">Atendido</option>
                    <option value="Controlado">Controlado</option>
                    <option value="Vencido">Vencido</option>
                  </select>
                </td>
                <td>{emergencia.fecha || 'No especificado'}</td>
                <td>{emergencia.hora || 'No especificado'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}

export default TablaEmergencias;