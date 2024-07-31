import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, LoadScriptNext, InfoWindow } from '@react-google-maps/api';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../../firebase'; // Asegúrate de que la ruta es correcta
import NavBar from '../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // Usa useNavigate en lugar de Navigate
import { auth } from '../../firebase';

const mapContainerStyle = {
  height: "800px",
  width: "100%"
};

// Coordenadas centradas en Bolivia
const center = {
  lat: -16.290154,
  lng: -63.588653
};

// Un nivel de zoom que muestra la mayor parte del país
const zoomLevel = 6;

const Situacion = () => {
  const [emergencias, setEmergencias] = useState([]);
  const [selectedEmergencia, setSelectedEmergencia] = useState(null);
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
    const emergenciasRef = ref(database, 'ultimasEmergencias');

    const onEmergenciasChange = (snapshot) => {
      const emergenciasRaw = snapshot.val();
      console.log('Emergencias Raw:', emergenciasRaw);

      const emergenciasFiltradas = emergenciasRaw
        ? Object.keys(emergenciasRaw)
          .filter(key => emergenciasRaw[key].estado === 'Activo')
          .map(key => ({
            id: key,
            ...emergenciasRaw[key],
          }))
        : [];

      console.log('Emergencias Filtradas:', emergenciasFiltradas);
      setEmergencias(emergenciasFiltradas);
    };

    onValue(emergenciasRef, onEmergenciasChange);

    return () => {
      off(emergenciasRef, 'value', onEmergenciasChange);
    };
  }, []);

  const parseUbicacion = (ubicacionUrl) => {
    const decodedUrl = decodeURIComponent(ubicacionUrl);
    const regex = /query=([0-9.-]+),\s*([0-9.-]+)/;
    const match = regex.exec(decodedUrl);
    if (match && match.length === 3) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      if (!isNaN(lat) && !isNaN(lng)) {
        console.log(`Parsed position: ${lat}, ${lng}`);
        return { lat, lng };
      }
    }
    return null;
  };

  return (
    <div>
      <NavBar handleSignOut={handleSignOut} />
      <LoadScriptNext googleMapsApiKey="AIzaSyBUgMwsBl7aogNEVLOPzCfTBU2qky9e924">
        <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={zoomLevel}>
          {emergencias.map((emergencia) => {
            if (emergencia.estado !== 'Activo') {
              return null; // Solo procesar emergencias con estado 'Activo'
            }
            const position = parseUbicacion(emergencia.ubicacion);
            return (
              position && (
                <Marker
                  key={emergencia.id}
                  position={position}
                  onClick={() => setSelectedEmergencia(emergencia)}
                />
              )
            );
          })}

          {selectedEmergencia && (
            <InfoWindow
              position={parseUbicacion(selectedEmergencia.ubicacion)}
              onCloseClick={() => setSelectedEmergencia(null)}
            >
              <div>
                <h2>{selectedEmergencia.Titulo}</h2>
                <p>{selectedEmergencia.descripcion}</p>
                <p>Estado: {selectedEmergencia.estado}</p>
                <p>Fecha: {selectedEmergencia.fecha}</p>
                <p>Hora: {selectedEmergencia.hora}</p>
                {selectedEmergencia.imagen && (
                  <img src={selectedEmergencia.imagen} alt={selectedEmergencia.descripcion} style={{ width: "100%", maxHeight: "200px" }} />
                )}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScriptNext>
    </div>
  );
};

export default Situacion;