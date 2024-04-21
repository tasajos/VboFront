import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import NavBar from '../../NavBar/navbar';

function EditarEmergencia() {
  let { id } = useParams();
  const [emergencia, setEmergencia] = useState({});
  const [estado, setEstado] = useState('');
  const [tipo, setTipo] = useState('');
  const [Titulo, setTitulo] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [ubicacion, setUbicacion] = useState('');

  useEffect(() => {
    const db = getDatabase();
    const emergenciaRef = ref(db, `ultimasEmergencias/${id}`);

    const unsubscribe = onValue(emergenciaRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setEmergencia(data);
        setEstado(data.estado || '');
        setTipo(data.tipo || '');
        setTitulo(data.Titulo || '');
        setCiudad(data.ciudad || '');
        // Convertir la cadena de ubicación en una URL de Google Maps al cargar los datos
        const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${data.ubicacion}`;
        setUbicacion(googleMapsLink);
      } else {
        console.error("No se encontraron datos para la emergencia con ID:", id);
      }
    }, (error) => {
      console.error("Error al recuperar la emergencia:", error);
    });

    return () => unsubscribe();
  }, [id]);

  const actualizarEmergencia = () => {
    const db = getDatabase();
    // Cuando actualices, asegúrate de que la ubicación ya tenga el formato de enlace completo de Google Maps
    const updatedData = {
      estado,
      tipo,
      Titulo,
      ciudad,
      ubicacion // Ahora esto tiene el formato de URL completo
    };
    update(ref(db, `ultimasEmergencias/${id}`), updatedData).catch(error => {
      console.error("Error al actualizar la emergencia:", error);
    });
  };

  // La ubicación ya está formateada como una URL de Google Maps
  const googleMapsUrl = ubicacion;

  if (!emergencia) {
    return (
      <div>
        <NavBar />
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div>
      <NavBar />
      <h2>Editando Emergencia {id}</h2>
      <div>
        <label htmlFor="Titulo">Título:</label>
        <input
          id="Titulo"
          type="text"
          value={Titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="ciudad">Ciudad:</label>
        <select id="ciudad" value={ciudad} onChange={(e) => setCiudad(e.target.value)}>
          <option value="">Seleccione una ciudad</option>
          <option value="La Paz">La Paz</option>
          <option value="Cochabamba">Cochabamba</option>
          <option value="Santa Cruz">Santa Cruz</option>
          <option value="Beni">Beni</option>
          <option value="Pando">Pando</option>
          <option value="Tarija">Tarija</option>
          <option value="Oruro">Oruro</option>
          <option value="Chuquisaca">Chuquisaca</option>
          <option value="Potosi">
Potosí</option>
</select>
</div>
<div>
<label htmlFor="estado">Estado:</label>
<select id="estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
<option value="Activo">Activo</option>
<option value="Pendiente">Pendiente</option>
<option value="Atendido">Atendido</option>
<option value="Controlado">Controlado</option>
<option value="Vencido">Vencido</option>
</select>
</div>
<div>
<label htmlFor="tipo">Tipo:</label>
<select id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
<option value="Incendio">Incendio</option>
<option value="Incendio Forestal">Incendio Forestal</option>
<option value="Rescate Animal">Rescate Animal</option>
<option value="Rescate">Rescate</option>
<option value="Embarrancamiento">Embarrancamiento</option>
<option value="Inundacion">Inundación</option>
<option value="Deslave">Deslave</option>
<option value="Vehicular">Vehicular</option>
<option value="Policial">Policial</option>
</select>
</div>
<div>
<label htmlFor="ubicacion">Ubicación en Google Maps:</label>
<input
       id="ubicacion"
       type="text"
       value={googleMapsUrl}
       readOnly
     />
</div>
<button onClick={actualizarEmergencia}>Actualizar Emergencia</button>
</div>
);
}

export default EditarEmergencia;
