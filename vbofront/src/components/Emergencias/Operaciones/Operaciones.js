import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, onValue, off, update } from 'firebase/database';
import './Operaciones.css'; 
import NavBar from '../../NavBar/navbar';

function Operaciones() {
    const navigate = useNavigate();
    const [emergencias, setEmergencias] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [ordenColumna, setOrdenColumna] = useState('');
    const [ordenDireccion, setOrdenDireccion] = useState('asc');
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
      const db = getDatabase();
      const emergenciasRef = ref(db, 'ultimasEmergencias');
  
      const onEmergenciasChange = (snapshot) => {
        const emergenciasRaw = snapshot.val();
        const emergenciasList = emergenciasRaw ? Object.keys(emergenciasRaw).map(key => {
          const emergenciaData = emergenciasRaw[key];
          const historial = emergenciaData.historial 
            ? Object.keys(emergenciaData.historial).map(historialKey => ({
              id: historialKey,
              ...emergenciaData.historial[historialKey]
            })) 
            : [];
          return {
            id: key,
            ...emergenciaData,
            historial
          };
        }).filter(emergencia => emergencia.estado === 'Activo') : [];
        setEmergencias(emergenciasList);
      };
  
      onValue(emergenciasRef, onEmergenciasChange);
      return () => off(emergenciasRef, 'value', onEmergenciasChange);
    }, []);

    const handleOrdenar = (columna) => {
        const nuevaDireccion = ordenColumna === columna && ordenDireccion === 'asc' ? 'desc' : 'asc';
        setOrdenColumna(columna);
        setOrdenDireccion(nuevaDireccion);
    
        const sortedEmergencias = [...emergencias].sort((a, b) => {
          if (a[columna] < b[columna]) return nuevaDireccion === 'asc' ? -1 : 1;
          if (a[columna] > b[columna]) return nuevaDireccion === 'asc' ? 1 : -1;
          return 0;
        });
    
        setEmergencias(sortedEmergencias);
    };

    const handleActualizarEstado = (id, nuevoEstado) => {
      const db = getDatabase();
      const emergenciaRef = ref(db, `ultimasEmergencias/${id}`);
      update(emergenciaRef, { estado: nuevoEstado })
        .then(() => {
          setMensaje('Estado actualizado correctamente.');
          setTimeout(() => setMensaje(''), 3000);
          window.location.reload();
        })
        .catch(error => {
          console.error("Error al actualizar el estado:", error);
          setMensaje('Error al actualizar el estado.');
          setTimeout(() => setMensaje(''), 3000);
        });
    };

    const renderTablaEmergencias = () => {
      return emergencias.map((emergencia) => (
        <React.Fragment key={emergencia.id}>
          <tr className="emergencia-principal">
            <td>{emergencia.Titulo || 'No especificado'}</td>
            <td>{emergencia.ciudad || 'No especificado'}</td>
            <td>{emergencia.descripcion || 'No especificado'}</td>
            <td>{emergencia.tipo || 'No especificado'}</td>
            <td>
              <select value={emergencia.estado} onChange={(e) => handleActualizarEstado(emergencia.id, e.target.value)}>
                <option value="Activo">Activo</option>
                <option value="Atendido">Atendido</option>
                <option value="Controlado">Controlado</option>
                <option value="Vencido">Vencido</option>
              </select>
            </td>
            <td>{emergencia.fecha || 'No especificado'}</td>
            <td>{emergencia.hora || 'No especificado'}</td>
          </tr>
          {emergencia.historial && emergencia.historial.map((itemHistorial) => (
            <tr key={itemHistorial.id} className={`historial-detalle ${itemHistorial.subestado === 'Completado' ? 'completado' : ''}`}>
              <td>Hist. Estado: {itemHistorial.subestado || 'No especificado'}</td>
              <td>Responsable: {itemHistorial.telefonoResponsable || 'No especificado'}</td>
              <td>Unidad: {itemHistorial.unidad || 'No especificado'}</td>
              <td colSpan="4">Fecha: {new Date(itemHistorial.timestamp).toLocaleString() || 'No especificado'}</td>
            </tr>
          ))}
        </React.Fragment>
      ));
    };

    return (
      <div className="tabla-container">
        <NavBar />
        {mensaje && <div className="alert">{mensaje}</div>}
        <input
          type="text"
          placeholder="Buscar emergencias..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value.toLowerCase())}
          className="search-input"
        />
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
            {renderTablaEmergencias()}
          </tbody>
        </table>
      </div>
    );
}

export default Operaciones;
