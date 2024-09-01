import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import './ListaEquipo.css'; // Archivo CSS para el estilo
import { Table, Button, Form, Dropdown, Modal } from 'react-bootstrap';
import NavBar from '../../../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../../firebase';

function ListaEquipos() {
  const [equipos, setEquipos] = useState([]);
  const [unidadUsuario, setUnidadUsuario] = useState(localStorage.getItem('userUnit') || '');
  const [filteredEquipos, setFilteredEquipos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEquipo, setSelectedEquipo] = useState(null);
  const [newEstado, setNewEstado] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const db = getDatabase();
    const equiposRef = ref(db, `fundacion/equipos/${unidadUsuario}`);
    
    onValue(equiposRef, (snapshot) => {
      const equiposData = snapshot.val();
      const equiposArray = [];
      
      if (equiposData) {
        Object.entries(equiposData).forEach(([tipo, equiposPorTipo]) => {
          Object.entries(equiposPorTipo).forEach(([key, equipo]) => {
            equiposArray.push({
              id: key,
              ...equipo,
              tipoEquipo: tipo, // Asigna el tipo de equipo (VEH, EQP, etc.)
            });
          });
        });
      }

      // Filtrar equipos que no estén en estado "Baja"
      const activosEquipos = equiposArray.filter(equipo => equipo.estado !== 'Baja');

      setEquipos(activosEquipos);
      setFilteredEquipos(activosEquipos);
    });
  }, [unidadUsuario]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/signin');
      console.log('Sesión cerrada');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredEquipos(equipos.filter(equipo => 
      (equipo.nombre && equipo.nombre.toLowerCase().includes(term)) || 
      (equipo.codigo && equipo.codigo.toLowerCase().includes(term))
    ));
  };

  const handleFilterChange = (filter) => {
    setFilterBy(filter);
    setFilteredEquipos(equipos.filter(equipo => equipo.estado === filter));
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    const sortedEquipos = [...filteredEquipos].sort((a, b) => {
      if (sort === 'fecha') return new Date(a.fechaAdquisicion) - new Date(b.fechaAdquisicion);
      if (sort === 'tipo') return a.tipoEquipo.localeCompare(b.tipoEquipo);
      if (sort === 'nombre') return a.nombre.localeCompare(b.nombre);
      if (sort === 'codigo') return a.codigo.localeCompare(b.codigo);
      return 0;
    });
    setFilteredEquipos(sortedEquipos);
  };

  const handleShowDeleteModal = (equipo) => {
    setSelectedEquipo(equipo);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedEquipo(null);
  };

  const handleDelete = () => {
    const db = getDatabase();
    const equipoRef = ref(db, `fundacion/equipos/${unidadUsuario}/${selectedEquipo.tipoEquipo}/${selectedEquipo.id}`);
    
    update(equipoRef, { estado: 'Baja' }).then(() => {
      setFilteredEquipos(filteredEquipos.filter(equipo => equipo.id !== selectedEquipo.id));
      setShowDeleteModal(false);
    });
  };

  const handleShowEditModal = (equipo) => {
    setSelectedEquipo(equipo);
    setNewEstado(equipo.estado); // Inicializar con el estado actual
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedEquipo(null);
  };

  const handleEdit = () => {
    const db = getDatabase();
    const equipoRef = ref(db, `fundacion/equipos/${unidadUsuario}/${selectedEquipo.tipoEquipo}/${selectedEquipo.id}`);
    
    update(equipoRef, { estado: newEstado }).then(() => {
      setFilteredEquipos(filteredEquipos.map(equipo => 
        equipo.id === selectedEquipo.id ? { ...equipo, estado: newEstado } : equipo
      ));
      setShowEditModal(false);
    });
  };

  return (
    <div>
      <NavBar handleSignOut={handleSignOut} />
      <div className="lista-equipos-container">
        <h2 className="lista-equipos-header">Lista de Equipos</h2>
        
        <Form.Control 
          type="text" 
          placeholder="Buscar por nombre o código..." 
          value={searchTerm} 
          onChange={handleSearch} 
          className="mb-3"
        />
        
        <Dropdown onSelect={handleFilterChange} className="mb-3">
          <Dropdown.Toggle variant="success" id="dropdown-basic">
            Filtrar por Estado
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item eventKey="Nuevo">Nuevo</Dropdown.Item>
            <Dropdown.Item eventKey="Usado">Usado</Dropdown.Item>
            <Dropdown.Item eventKey="Dañado">Dañado</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        <Dropdown onSelect={handleSortChange} className="mb-3">
          <Dropdown.Toggle variant="info" id="dropdown-basic">
            Ordenar por
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item eventKey="tipo">Tipo de Equipo</Dropdown.Item>
            <Dropdown.Item eventKey="nombre">Nombre</Dropdown.Item>
            <Dropdown.Item eventKey="codigo">Código</Dropdown.Item>
            <Dropdown.Item eventKey="fecha">Fecha de Adquisición</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Código</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Fecha de Adquisición</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredEquipos.map((equipo, index) => (
              <tr key={index}>
                <td>{equipo.nombre}</td>
                <td>{equipo.codigo}</td>
                <td>{equipo.tipoEquipo}</td>
                <td>{equipo.estado}</td>
                <td>{new Date(equipo.fechaAdquisicion).toLocaleDateString()}</td>
                <td>
                  <Button variant="warning" onClick={() => handleShowEditModal(equipo)}>Editar</Button>{' '}
                  <Button variant="danger" onClick={() => handleShowDeleteModal(equipo)}>Eliminar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Marcar Equipo como Baja</Modal.Title>
        </Modal.Header>
        <Modal.Body>¿Está seguro de que desea marcar el equipo {selectedEquipo?.nombre} como Baja?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete}>Confirmar</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Estado del Equipo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label htmlFor="estadoEquipo">Estado del Equipo:</label>
            <select
              id="estadoEquipo"
              className="form-control"
              value={newEstado}
              onChange={(e) => setNewEstado(e.target.value)}
            >
              <option value="Nuevo">Nuevo</option>
              <option value="Usado">Usado</option>
              <option value="Dañado">Dañado</option>
            </select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>Cancelar</Button>
          <Button variant="primary" onClick={handleEdit}>Guardar Cambios</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ListaEquipos;
