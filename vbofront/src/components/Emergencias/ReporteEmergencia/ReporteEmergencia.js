import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, off, update, remove } from 'firebase/database';
import './ReporteEmergencia.css';
import NavBar from '../../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../firebase';
import { FaEdit, FaTrash, FaFileExport } from 'react-icons/fa';
import { Modal, Button } from 'react-bootstrap';
import * as XLSX from 'xlsx';

function ReporteEmergencia() {
  const [emergenciasAtendidas, setEmergenciasAtendidas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [ordenColumna, setOrdenColumna] = useState('');
  const [ordenDireccion, setOrdenDireccion] = useState('asc');
  const [mensaje, setMensaje] = useState('');
  const [emergenciaSeleccionada, setEmergenciaSeleccionada] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
    const emergenciasRef = ref(db, 'ultimasEmergencias');

    const onEmergenciasChange = (snapshot) => {
      const emergenciasRaw = snapshot.val();
      const emergenciasList = emergenciasRaw ? Object.keys(emergenciasRaw).map(key => ({
        id: key,
        ...emergenciasRaw[key]
      })).filter(emergencia => emergencia.estado === 'Atendido') : [];
      setEmergenciasAtendidas(emergenciasList);
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
        setShowEditModal(false);
        window.location.reload(); // Recargar la página para reflejar los cambios
      })
      .catch(error => {
        console.error("Error al actualizar el estado:", error);
        setMensaje('Error al actualizar el estado.');
        setTimeout(() => setMensaje(''), 3000);
      });
  };

  const handleEliminarEmergencia = (id) => {
    const db = getDatabase();
    const emergenciaRef = ref(db, `ultimasEmergencias/${id}`);

    remove(emergenciaRef)
      .then(() => {
        setMensaje('Emergencia eliminada correctamente.');
        setTimeout(() => setMensaje(''), 3000);
        setShowDeleteModal(false);
      })
      .catch(error => {
        console.error("Error al eliminar la emergencia:", error);
        setMensaje('Error al eliminar la emergencia.');
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

  const handleEditarClick = (emergencia) => {
    setEmergenciaSeleccionada(emergencia);
    setShowEditModal(true);
  };

  const handleEliminarClick = (emergencia) => {
    setEmergenciaSeleccionada(emergencia);
    setShowDeleteModal(true);
  };

  const exportarAExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(emergenciasAtendidas);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Emergencias Atendidas");
    XLSX.writeFile(workbook, "ReporteEmergenciasAtendidas.xlsx");
  };

  return (
    <div>
      <NavBar handleSignOut={handleSignOut} />
      <br></br>
      <br></br>
      <div className="tabla-container">
        {mensaje && <div className="alert">{mensaje}</div>}
        <div className="search-export-container">
          <input
            type="text"
            placeholder="Buscar emergencias..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value.toLowerCase())}
            className="search-input"
          />
          <button className="exportar-btn" onClick={exportarAExcel}>
            <FaFileExport /> Exportar a Excel
          </button>
        </div>

        {/* Tabla de emergencias atendidas */}
        <h2>Emergencias Atendidas</h2>
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
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrarEmergencias(emergenciasAtendidas).map((emergencia) => (
              <tr key={emergencia.id}>
                <td>{emergencia.Titulo || 'No especificado'}</td>
                <td>{emergencia.ciudad || 'No especificado'}</td>
                <td>{emergencia.descripcion || 'No especificado'}</td>
                <td>{emergencia.tipo || 'No especificado'}</td>
                <td>{emergencia.estado || 'No especificado'}</td>
                <td>{emergencia.fecha || 'No especificado'}</td>
                <td>{emergencia.hora || 'No especificado'}</td>
                <td>
                  <FaEdit
                    onClick={() => handleEditarClick(emergencia)}
                    style={{ cursor: 'pointer', color: 'blue', marginRight: '10px' }}
                  />
                  <FaTrash
                    onClick={() => handleEliminarClick(emergencia)}
                    style={{ cursor: 'pointer', color: 'red' }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal para editar emergencia */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Editar Estado de Emergencia</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="form-group">
              <label>Estado:</label>
              <select
                value={emergenciaSeleccionada?.estado || ''}
                onChange={(e) =>
                  setEmergenciaSeleccionada({ ...emergenciaSeleccionada, estado: e.target.value })
                }
                className="form-control"
              >
                <option value="Activo">Activo</option>
                <option value="Atendido">Atendido</option>
                <option value="Controlado">Controlado</option>
                <option value="Vencido">Vencido</option>
              </select>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() =>
                handleActualizarEstado(emergenciaSeleccionada.id, emergenciaSeleccionada.estado)
              }
            >
              Guardar
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal para eliminar emergencia */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Eliminar Emergencia</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>¿Estás seguro de que deseas eliminar esta emergencia?</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={() => handleEliminarEmergencia(emergenciaSeleccionada.id)}>
              Eliminar
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default ReporteEmergencia;
