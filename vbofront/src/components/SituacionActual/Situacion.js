import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, LoadScriptNext } from '@react-google-maps/api';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../../firebase'; // Asegúrate de que la ruta es correcta

const mapContainerStyle = {
  height: "600px",
  width: "100%"
};

// Coordenadas centradas en Bolivia
const center = {
    lat: -16.290154, // Aproximadamente el centro geográfico de Bolivia
    lng: -63.588653
  };

  // Un nivel de zoom que muestra la mayor parte del país
const zoomLevel = 6; // Ajusta según sea necesario para lograr el alcance deseado

const Situacion = () => {
  const [emergencias, setEmergencias] = useState([]);

  useEffect(() => {
    const emergenciasRef = ref(database, 'ultimasEmergencias');

    const onEmergenciasChange = (snapshot) => {
      const emergenciasRaw = snapshot.val();
      const emergenciasList = emergenciasRaw ? Object.keys(emergenciasRaw).map((key) => ({
        id: key,
        ...emergenciasRaw[key],
      })) : [];
      setEmergencias(emergenciasList);
    };

    onValue(emergenciasRef, onEmergenciasChange);

    return () => {
      off(emergenciasRef, 'value', onEmergenciasChange); // Usar 'off' con los mismos argumentos que 'onValue'
    };
  }, []);

  const parseUbicacion = (ubicacionString) => {
    if (!ubicacionString) {
      return null;
    }
    const parts = ubicacionString.split(',');
    if (parts.length === 2) {
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
    return null;
  };

  return (
    <LoadScriptNext googleMapsApiKey="AIzaSyBUgMwsBl7aogNEVLOPzCfTBU2qky9e924">
      <GoogleMap mapContainerStyle={mapContainerStyle} center={center}zoom={zoomLevel}>
        {emergencias.map((emergencia) => {
          if (!emergencia.ubicacion) {
            return null; // Si no hay ubicación, no renderizar el marcador
          }
          const position = parseUbicacion(emergencia.ubicacion);
          return (
            position && (
              <Marker key={emergencia.id} position={position}>
                {/* Puedes incluir más información en el Popup si es necesario */}
              </Marker>
            )
          );
        })}
      </GoogleMap>
      </LoadScriptNext>
  );
};

export default Situacion;