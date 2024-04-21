import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import './TablaEmergencias.css'; 
import NavBar from '../../NavBar/navbar';

function TablaEmergencias() {
  const [emergencias, setEmergencias] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const db = getDatabase();
    const emergenciasRef = ref(db, 'ultimasEmergencias');

    const onEmergenciasChange = (snapshot) => {
      const emergenciasRaw = snapshot.val();
      const emergenciasList = emergenciasRaw ? Object.values(emergenciasRaw) : [];
      setEmergencias(emergenciasList);
    };

    // Agrega el listener
    onValue(emergenciasRef, onEmergenciasChange);

    // Retorna una función para desmontar el listener
    return () => {
      // Usa el método 'off' del objeto 'emergenciasRef' directamente
      off(emergenciasRef, 'value', onEmergenciasChange);
    };
  }, []);

  const emergenciasFiltradas = busqueda
  ? emergencias.filter((emergencia) =>
      (emergencia.Titulo && emergencia.Titulo.toLowerCase().includes(busqueda.toLowerCase())) ||
      (emergencia.descripcion && emergencia.descripcion.toLowerCase().includes(busqueda.toLowerCase()))||
      (emergencia.tipo && emergencia.tipo.toLowerCase().includes(busqueda.toLowerCase()))
      
    )
  : emergencias;

  return (
    <div className="tabla-container">
         <NavBar />
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
            
            {/* Agregar más columnas si es necesario */}
          </tr>
        </thead>
        <tbody>
  {emergenciasFiltradas.map((emergencia) => (
    <tr key={emergencia.id}>
      <td>{emergencia.Titulo || 'No especificado'}</td>
      <td>{emergencia.ciudad || 'No especificado'}</td>
      <td>{emergencia.descripcion || 'No especificado'}</td>
      <td>{emergencia.tipo || 'No especificado'}</td>
      <td>{emergencia.estado || 'No especificado'}</td>
      <td>{emergencia.fecha || 'No especificado'}</td>
      <td>{emergencia.hora || 'No especificado'}</td>
      {/* Agregar más celdas si es necesario */}
    </tr>
  ))}
</tbody>
      </table>
    </div>
  );
}

export default TablaEmergencias;
