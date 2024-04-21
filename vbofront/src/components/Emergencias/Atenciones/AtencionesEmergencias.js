import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, off, update } from 'firebase/database';
import './TablaEmergencias.css'; 
import NavBar from '../../NavBar/navbar';

function TablaEmergencias() {
  const [emergencias, setEmergencias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [ordenColumna, setOrdenColumna] = useState('');
  const [ordenDireccion, setOrdenDireccion] = useState('asc');
  const [mensaje, setMensaje] = useState('');
  const [estadoTemp, setEstadoTemp] = useState({}); // Para manejar estados temporales

  useEffect(() => {
    const db = getDatabase();
    const emergenciasRef = ref(db, 'ultimasEmergencias');

    const onEmergenciasChange = (snapshot) => {
      const emergenciasRaw = snapshot.val();
      const emergenciasList = emergenciasRaw ? Object.keys(emergenciasRaw).map(key => ({
        id: key,
        ...emergenciasRaw[key]
      })).filter(emergencia => emergencia.estado === 'Activo') : [];
      setEmergencias(emergenciasList);
    };

    onValue(emergenciasRef, onEmergenciasChange);
    return () => off(emergenciasRef, 'value', onEmergenciasChange);
  }, []);

  const handleActualizarEstado = (id) => {
    if (!id) {
      console.error("ID de emergencia no definido");
      return;
    }
    const nuevoEstado = estadoTemp[id];
    const db = getDatabase();
    const emergenciaRef = ref(db, `ultimasEmergencias/${id}`);

    update(emergenciaRef, { estado: nuevoEstado })
      .then(() => {
        setMensaje('Estado actualizado correctamente.');
        setTimeout(() => setMensaje(''), 3000);
      })
      .catch(error => {
        console.error("Error al actualizar el estado:", error);
        setMensaje('Error al actualizar el estado.');
        setTimeout(() => setMensaje(''), 3000);
      });
  };

  const handleEstadoChange = (id, value) => {
    setEstadoTemp(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="tabla-container">
      <NavBar />
      {mensaje && <div className="alert">{mensaje}</div>}
      <input
        type="text"
        placeholder="Buscar emergencias..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="search-input"
      />
      <table className="emergencias-table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Ciudad</th>
            <th>Descripción</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th>Hora</th>
          </tr>
        </thead>
        <tbody>
          {emergencias.map((emergencia) => (
            <tr key={emergencia.id}>
              <td>{emergencia.Titulo || 'No especificado'}</td>
              <td>{emergencia.ciudad || 'No especificado'}</td>
              <td>{emergencia.descripcion || 'No especificado'}</td>
              <td>{emergencia.tipo || 'No especificado'}</td>
              <td>
                <select
                  value={estadoTemp[emergencia.id] || emergencia.estado}
                  onChange={(e) => handleEstadoChange(emergencia.id, e.target.value)}
                >
                    <option value="Activo">Activo</option>
                  <option value="Atendido">Atendido</option>
                  <option value="Controlado">Controlado</option>
                  <option value="Vencido">Vencido</option>
                </select>
                <button onClick={() => handleActualizarEstado(emergencia.id)}>Actualizar</button>
              </td>
              <td>{emergencia.fecha || 'No especificado'}</td>
              <td>{emergencia.hora || 'No especificado'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TablaEmergencias;
