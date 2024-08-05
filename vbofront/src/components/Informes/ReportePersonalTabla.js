import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import * as XLSX from 'xlsx';
import './ReporteTablaPersonal.css';
import NavBar from '../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';

function ReportePersonalTabla() {
  const [data, setData] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [fechaFiltro, setFechaFiltro] = useState('');
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/signin');
      console.log('Sesión cerrada');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

  useEffect(() => {
    const db = getDatabase();
    const incidentesRef = ref(db, 'formulariosci/211');

    const onDataChange = (snapshot) => {
      const dataRaw = snapshot.val();
      const dataList = dataRaw
        ? Object.keys(dataRaw).map((key) => ({
            id: key,
            ...dataRaw[key],
          }))
        : [];
      setData(dataList);
    };

    onValue(incidentesRef, onDataChange);

    return () => {
      off(incidentesRef, onDataChange);
    };
  }, []);

  const filterData = () => {
    return data.filter((registro) => {
      const fecha = new Date(registro.fechaHora).toISOString().slice(0, 10); // Format YYYY-MM-DD
      const matchesIncident = registro.nombreIncidente.toLowerCase().includes(busqueda.toLowerCase());
      const matchesDate = fechaFiltro ? fecha === fechaFiltro : true;
      return matchesIncident && matchesDate;
    });
  };

  const groupByInstitutionAndDate = () => {
    const groupedData = {};

    filterData().forEach((registro) => {
      const date = new Date(registro.fechaHora).toLocaleDateString();
      if (!groupedData[date]) {
        groupedData[date] = {};
      }

      registro.registroPersonal.forEach((personal) => {
        if (!groupedData[date][personal.institucion]) {
          groupedData[date][personal.institucion] = [];
        }
        groupedData[date][personal.institucion].push({
          ...personal,
          nombreIncidente: registro.nombreIncidente,
          fecha: date,
        });
      });
    });

    return groupedData;
  };

  const datosAgrupados = groupByInstitutionAndDate();

  const handleClearFilter = () => {
    setBusqueda('');
    setFechaFiltro('');
  };

  const handleExportXLS = () => {
    const filteredData = filterData();
    const exportData = [];

    filteredData.forEach((registro) => {
      registro.registroPersonal.forEach((personal) => {
        exportData.push({
          Fecha: new Date(registro.fechaHora).toLocaleDateString(),
          Incidente: registro.nombreIncidente,
          Nombre: personal.nombre,
          Institución: personal.institucion,
          'Hora de Entrada': personal.horaEntrada,
          'Hora de Salida': personal.horaSalida,
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');
    XLSX.writeFile(workbook, 'ReporteGralPersonal.xlsx');
  };

  return (
    <div>
      <NavBar handleSignOut={handleSignOut} />
      <br />
      <div className="tabla-container">
        <input
          type="text"
          placeholder="Buscar por incidente..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value.toLowerCase())}
          className="search-input"
        />
        <input
          type="date"
          value={fechaFiltro}
          onChange={(e) => setFechaFiltro(e.target.value)}
          className="date-input"
        />
        <button className="clear-filter-button" onClick={handleClearFilter}>
          Limpiar Filtro
        </button>
        <button className="export-xls-button" onClick={handleExportXLS}>
          Exportar XLS
        </button>
        <table className="usuarios-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Incidente</th>
              <th>Unidad</th>
              <th>Detalles del Personal</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(datosAgrupados).map(([fecha, instituciones]) =>
              Object.entries(instituciones).map(([institucion, personalList]) => (
                <tr key={`${fecha}-${institucion}`}>
                  <td>{fecha}</td>
                  <td>{personalList[0].nombreIncidente || 'No especificado'}</td>
                  <td>{institucion || 'No especificado'}</td>
                  <td>
                    <ul>
                      {personalList.map((personal, index) => (
                        <li key={index}>
                          {personal.nombre || 'No especificado'} ({personal.horaEntrada || '--:--'} a {personal.horaSalida || '--:--'})
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReportePersonalTabla;

