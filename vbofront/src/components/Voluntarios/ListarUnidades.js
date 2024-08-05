import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, update, remove } from 'firebase/database';
import './ListarUnidades.css';
import NavBar from '../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Modal, Button } from 'react-bootstrap';

function ListarUnidades() {
  const [unidades, setUnidades] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [unidadEditando, setUnidadEditando] = useState(null);
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [tipoUnidad, setTipoUnidad] = useState('');
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
    if (tipoUnidad) {
      const db = getDatabase();
      const unidadesRef = ref(db, tipoUnidad);

      const onDataChange = (snapshot) => {
        const data = snapshot.val();
        const unidadesLista = data
          ? Object.keys(data).map((key) => ({
              id: key,
              ...data[key],
            }))
          : [];
        setUnidades(unidadesLista);
      };

      const unsubscribe = onValue(unidadesRef, onDataChange);

      return () => {
        unsubscribe(); // Properly unsubscribe the listener
      };
    }
  }, [tipoUnidad]);

  const handleEditClick = (unidad) => {
    setUnidadEditando(unidad);
    setEditModalIsOpen(true);
  };

  const handleDeleteClick = (unidad) => {
    setUnidadEditando(unidad);
    setDeleteModalIsOpen(true);
  };

  const handleSaveChanges = () => {
    if (!tipoUnidad) return;

    const db = getDatabase();
    const unidadRef = ref(db, `${tipoUnidad}/${unidadEditando.id}`);
    update(unidadRef, unidadEditando).then(() => {
      setMensaje('Unidad actualizada correctamente.');
      setTimeout(() => {
        setMensaje('');
        setEditModalIsOpen(false);
        setUnidadEditando(null);
      }, 1000);
    });
  };

  const handleDeleteUnidad = () => {
    if (!tipoUnidad) return;

    const db = getDatabase();
    const unidadRef = ref(db, `${tipoUnidad}/${unidadEditando.id}`);
    remove(unidadRef)
      .then(() => {
        setMensaje('Unidad eliminada correctamente.');
        setTimeout(() => {
          setMensaje('');
          setDeleteModalIsOpen(false);
          setUnidadEditando(null);
        }, 1000);
      })
      .catch((error) => {
        console.error('Error al eliminar la unidad:', error);
        setMensaje('Error al eliminar la unidad.');
        setTimeout(() => setMensaje(''), 3000);
      });
  };

  const unidadesFiltradas = unidades.filter((unidad) =>
    (unidad.nombre || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      <NavBar handleSignOut={handleSignOut} />
      <div className="tabla-unidades-container">
        <div className="filter-section">
          <select
            value={tipoUnidad}
            onChange={(e) => setTipoUnidad(e.target.value)}
            className="form-control"
          >
            <option value="">Seleccione un tipo de unidad</option>
            <option value="epr">EPR</option>
            <option value="educacion">Educación</option>
            <option value="animalistas">Animalistas</option>
            <option value="ambulancia">Ambulancia</option>
            <option value="ambientalistas">Ambientalistas</option>
          </select>
          <input
            type="text"
            placeholder="Buscar unidades..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="search-input"
          />
        </div>
        {mensaje && <div className="alert">{mensaje}</div>}
        <table className="tabla-unidades">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Ciudad</th>
              <th>Teléfono</th>
              <th>WhatsApp</th>
              <th>Facebook</th>
              <th>Web</th>
              <th>Imagen</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {unidadesFiltradas.map((unidad) => (
              <tr key={unidad.id}>
                <td>{unidad.nombre || 'No especificado'}</td>
                <td>{unidad.ciudad || 'No especificado'}</td>
                <td>{unidad.telefono || 'No especificado'}</td>
                <td>{unidad.whatsapp || 'No especificado'}</td>
                <td>{unidad.facebook || 'No especificado'}</td>
                <td>
                  {unidad.web ? (
                    <a href={unidad.web} target="_blank" rel="noopener noreferrer">
                      {unidad.web}
                    </a>
                  ) : (
                    'No especificado'
                  )}
                </td>
                <td>
                  {unidad.imagen ? (
                    <img src={unidad.imagen} alt={unidad.nombre} style={{ width: '50px' }} />
                  ) : (
                    'No imagen'
                  )}
                </td>
                <td>
                  <FaEdit
                    onClick={() => handleEditClick(unidad)}
                    style={{ cursor: 'pointer', color: 'blue', marginRight: '10px' }}
                  />
                  <FaTrash
                    onClick={() => handleDeleteClick(unidad)}
                    style={{ cursor: 'pointer', color: 'red' }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Modal show={editModalIsOpen} onHide={() => setEditModalIsOpen(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Editar Unidad</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="form-group">
              <label>Nombre:</label>
              <input
                type="text"
                value={unidadEditando?.nombre || ''}
                onChange={(e) =>
                  setUnidadEditando((prev) => ({ ...prev, nombre: e.target.value }))
                }
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Ciudad:</label>
              <input
                type="text"
                value={unidadEditando?.ciudad || ''}
                onChange={(e) =>
                  setUnidadEditando((prev) => ({ ...prev, ciudad: e.target.value }))
                }
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Teléfono:</label>
              <input
                type="text"
                value={unidadEditando?.telefono || ''}
                onChange={(e) =>
                  setUnidadEditando((prev) => ({ ...prev, telefono: e.target.value }))
                }
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>WhatsApp:</label>
              <input
                type="text"
                value={unidadEditando?.whatsapp || ''}
                onChange={(e) =>
                  setUnidadEditando((prev) => ({ ...prev, whatsapp: e.target.value }))
                }
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Facebook:</label>
              <input
                type="text"
                value={unidadEditando?.facebook || ''}
                onChange={(e) =>
                  setUnidadEditando((prev) => ({ ...prev, facebook: e.target.value }))
                }
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Web:</label>
              <input
                type="text"
                value={unidadEditando?.web || ''}
                onChange={(e) =>
                  setUnidadEditando((prev) => ({ ...prev, web: e.target.value }))
                }
                className="form-control"
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setEditModalIsOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSaveChanges}>
              Guardar
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={deleteModalIsOpen} onHide={() => setDeleteModalIsOpen(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Eliminar Unidad</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>¿Estás seguro de que deseas eliminar esta unidad?</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setDeleteModalIsOpen(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDeleteUnidad}>
              Eliminar
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default ListarUnidades;
