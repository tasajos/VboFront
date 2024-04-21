import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, LoadScriptNext,InfoWindow  } from '@react-google-maps/api';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../../firebase'; // Asegúrate de que la ruta es correcta
import NavBar from '../NavBar/navbar';

const mapContainerStyle = {
  //height: "100%",
  height: "800px",
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
  const [selectedEmergencia, setSelectedEmergencia] = useState(null);

  useEffect(() => {
    const emergenciasRef = ref(database, 'ultimasEmergencias');

    const onEmergenciasChange = (snapshot) => {
        const emergenciasRaw = snapshot.val();
        console.log('Emergencias Raw:', emergenciasRaw); // Depuración: Imprime los datos brutos
  
        const emergenciasFiltradas = emergenciasRaw 
          ? Object.keys(emergenciasRaw)
              .filter(key => emergenciasRaw[key].estado === 'Activo')
              .map(key => ({
                id: key,
                ...emergenciasRaw[key],
              }))
          : [];
        
        console.log('Emergencias Filtradas:', emergenciasFiltradas); // Depuración: Imprime las emergencias filtradas
        setEmergencias(emergenciasFiltradas);
      };
  
      onValue(emergenciasRef, onEmergenciasChange);
  
      return () => {
        off(emergenciasRef, 'value', onEmergenciasChange);
      };
    }, []);

    const parseUbicacion = (ubicacionUrl) => {
        // Primero, decodificamos la URL
        const decodedUrl = decodeURIComponent(ubicacionUrl);
      
        // Luego, usamos la versión decodificada para extraer las coordenadas
        const regex = /query=([0-9.-]+),\s*([0-9.-]+)/;
        const match = regex.exec(decodedUrl);
        if (match && match.length === 3) {
            const lat = parseFloat(match[1]);
            const lng = parseFloat(match[2]);
            if (!isNaN(lat) && !isNaN(lng)) {
                console.log(`Parsed position: ${lat}, ${lng}`); // Para depuración
                return { lat, lng };
            }
        }
        return null;
      };

  return (
    <div>
    <NavBar />
    <LoadScriptNext googleMapsApiKey="AIzaSyBUgMwsBl7aogNEVLOPzCfTBU2qky9e924">
      <GoogleMap mapContainerStyle={mapContainerStyle} center={center}zoom={zoomLevel}>
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