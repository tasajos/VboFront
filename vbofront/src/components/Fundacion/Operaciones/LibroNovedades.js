import React, { useState, useEffect } from 'react';
import { getDatabase, ref, set, push, onValue } from 'firebase/database';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import DatePicker from 'react-datepicker';
import NavBar from '../../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../firebase';
import 'react-datepicker/dist/react-datepicker.css';
import './LibroNovedades.css';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function LibroDeNovedades() {
    const [fecha, setFecha] = useState(new Date());
    const [oficialDeGuardia, setOficialDeGuardia] = useState('');
    const [voluntariosServicio, setVoluntariosServicio] = useState([]);
    const [vehiculos, setVehiculos] = useState([]);
    const [inventario, setInventario] = useState('');
    const [novedades, setNovedades] = useState([]);
    const [firma, setFirma] = useState('');
    const [unidad, setUnidad] = useState('');
    const [listaVoluntarios, setListaVoluntarios] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [nuevaNovedad, setNuevaNovedad] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const unidadAutenticada = localStorage.getItem('userUnit');
        setUnidad(unidadAutenticada);

        const db = getDatabase();
        const voluntariosRef = ref(db, 'fundacion/personal');

        onValue(voluntariosRef, (snapshot) => {
            const voluntariosData = snapshot.val();
            const voluntariosArray = voluntariosData ? Object.values(voluntariosData).filter(vol => vol.unidad === unidadAutenticada) : [];
            setListaVoluntarios(voluntariosArray);
        });
    }, []);

    const handleAddNovedad = () => {
        const nueva = {
            hora: new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            descripcion: nuevaNovedad,
        };
        setNovedades([...novedades, nueva]);
        setNuevaNovedad('');
    };

    const handleGuardarTemporal = () => {
        const db = getDatabase();
        const libroNovedadesTempRef = ref(db, `libroNovedadesTemporal/${auth.currentUser.uid}`);
        set(libroNovedadesTempRef, {
            fecha: fecha.toISOString(),
            oficialDeGuardia,
            voluntariosServicio,
            vehiculos,
            inventario,
            novedades,
            firma,
            unidad,
        }).then(() => {
            setShowModal(true);
        }).catch(error => {
            console.error('Error al guardar temporalmente el libro de novedades:', error);
        });
    };

    const handleGuardarOficial = () => {
        const db = getDatabase();
        const libroNovedadesRef = push(ref(db, `libroNovedadesOficial/${unidad}`));
        set(libroNovedadesRef, {
            fecha: fecha.toISOString(),
            oficialDeGuardia,
            voluntariosServicio,
            vehiculos,
            inventario,
            novedades,
            firma,
            unidad,
        }).then(() => {
            setShowModal(true);
        }).catch(error => {
            console.error('Error al guardar oficialmente el libro de novedades:', error);
        });
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate('/signin');
        } catch (error) {
            console.error('Error al cerrar sesión', error);
        }
    };

    return (
        <div>
            <NavBar handleSignOut={handleSignOut} />
            <br></br>
            <div className="libro-novedades-container">
                <h2 className="text-center mb-4">Libro de Novedades</h2>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Fecha y Hora</Form.Label>
                        <DatePicker
                            selected={fecha}
                            onChange={date => setFecha(date)}
                            showTimeSelect
                            dateFormat="Pp"
                            className="form-control"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Oficial de Guardia</Form.Label>
                        <Form.Control
                            as="select"
                            value={oficialDeGuardia}
                            onChange={(e) => setOficialDeGuardia(e.target.value)}
                        >
                            <option value="">Seleccionar Oficial de Guardia</option>
                            {listaVoluntarios.map((vol) => (
                                <option key={vol.ci} value={vol.ci}>
                                    {vol.grado} {vol.apellidoPaterno} {vol.apellidoMaterno}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Voluntario de Servicio</Form.Label>
                        <Form.Control
                            as="select"
                            multiple
                            value={voluntariosServicio}
                            onChange={(e) => setVoluntariosServicio([...e.target.selectedOptions].map(option => option.value))}
                        >
                            {listaVoluntarios.map((vol) => (
                                <option key={vol.ci} value={vol.ci}>
                                    {vol.grado} {vol.nombre} {vol.apellidoPaterno} {vol.apellidoMaterno}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Vehículos</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Ingrese los vehículos"
                            value={vehiculos.join(', ')}
                            onChange={(e) => setVehiculos(e.target.value.split(',').map(v => v.trim()))}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Inventario de la Prevención de Guardia</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={inventario}
                            onChange={(e) => setInventario(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Novedades</Form.Label>
                        <div className="novedades-container">
                            {novedades.map((novedad, index) => (
                                <p key={index}>{novedad.hora}: {novedad.descripcion}</p>
                            ))}
                        </div>
                        <div className="d-flex">
                            <Form.Control
                                type="text"
                                placeholder="Añadir nueva novedad"
                                value={nuevaNovedad}
                                onChange={(e) => setNuevaNovedad(e.target.value)}
                            />
                            <Button variant="primary" onClick={handleAddNovedad} className="ms-2">Añadir</Button>
                        </div>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Firma</Form.Label>
                        <Form.Control
                            as="select"
                            value={firma}
                            onChange={(e) => setFirma(e.target.value)}
                        >
                            <option value="">Seleccionar Firma</option>
                            {listaVoluntarios.map((vol) => (
                                <option key={vol.ci} value={vol.ci}>
                                    {vol.grado} {vol.apellidoPaterno} {vol.apellidoMaterno}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                    <div className="d-flex justify-content-between">
                        <Button variant="warning" onClick={handleGuardarTemporal}>Guardar Temporalmente</Button>
                        <Button variant="success" onClick={handleGuardarOficial}>Guardar Oficialmente</Button>
                    </div>
                </Form>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Guardado Exitoso</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>El libro de novedades ha sido guardado correctamente.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setShowModal(false)}>Cerrar</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default LibroDeNovedades;
