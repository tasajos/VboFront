import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import './TablaEmergencias.css'; 
import NavBar from '../../NavBar/navbar';

function TablaEmergencias() {
  const [emergencias, setEmergencias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [ordenColumna, setOrdenColumna] = useState('');
  const [ordenDireccion, setOrdenDireccion] = useState('asc');

  useEffect(() => {
    const db = getDatabase();
    const emergenciasRef = ref(db, 'ultimasEmergencias');

    const onEmergenciasChange = (snapshot) => {
      const emergenciasRaw = snapshot.val();
      // Filtra solo los estados activos al recibir los datos
      const emergenciasList = emergenciasRaw 
        ? Object.values(emergenciasRaw).filter(emergencia => emergencia.estado === 'Activo')
        : [];
      setEmergencias(emergenciasList);
    };

    onValue(emergenciasRef, onEmergenciasChange);

    return () => off(emergenciasRef, 'value', onEmergenciasChange);
  }, []);

  // Filtra las emergencias antes de cualquier ordenación
  const emergenciasFiltradas = busqueda
    ? emergencias.filter((emergencia) =>
        (emergencia.Titulo && emergencia.Titulo.toLowerCase().includes(busqueda.toLowerCase())) ||
        (emergencia.descripcion && emergencia.descripcion.toLowerCase().includes(busqueda.toLowerCase())) ||
        (emergencia.tipo && emergencia.tipo.toLowerCase().includes(busqueda.toLowerCase()))
      )
    : emergencias;

  // Ordena las emergencias filtradas
  const emergenciasOrdenadas = emergenciasFiltradas.sort((a, b) => {
    const isAsc = ordenDireccion === 'asc';
    if (a[ordenColumna] < b[ordenColumna]) {
      return isAsc ? -1 : 1;
    }
    if (a[ordenColumna] > b[ordenColumna]) {
      return isAsc ? 1 : -1;
    }
    return 0;
  });

  const handleOrdenar = (columna) => {
    const nuevaDireccion = ordenColumna === columna && ordenDireccion === 'asc' ? 'desc' : 'asc';
    setOrdenColumna(columna);
    setOrdenDireccion(nuevaDireccion);
  };

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
            <th onClick={() => handleOrdenar('Titulo')}>Título</th>
            <th onClick={() => handleOrdenar('ciudad')}>Ciudad</th>
            <th onClick={() => handleOrdenar('descripcion')}>Descripción</th>
            <th onClick={() => handleOrdenar('tipo')}>Tipo</th>
            <th onClick={() => handleOrdenar('estado')}>Estado</th>
            <th onClick={() => handleOrdenar('fecha')}>Fecha</th>
            <th onClick={() => handleOrdenar('hora')}>Hora</th>
          </tr>
        </thead>
        <tbody>
          {emergenciasOrdenadas.map((emergencia) => (
            <tr key={emergencia.id}>
              <td>{emergencia.Titulo || 'No especificado'}</td>
              <td>{emergencia.ciudad || 'No especificado'}</td>
              <td>{emergencia.descripcion || 'No especificado'}</td>
              <td>{emergencia.tipo || 'No especificado'}</td>
              <td>{emergencia.estado || 'No especificado'}</td>
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