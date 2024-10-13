import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import NavBar from '../../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../firebase';
import './InformeMision.css';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';

function InformeMisiones() {
    const [misiones, setMisiones] = useState([]);
    const [filtroMes, setFiltroMes] = useState('');
    const [filtroAno, setFiltroAno] = useState('');
    const [patrulla, setPatrulla] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const meses = [
        { value: '1', label: 'Enero' },
        { value: '2', label: 'Febrero' },
        { value: '3', label: 'Marzo' },
        { value: '4', label: 'Abril' },
        { value: '5', label: 'Mayo' },
        { value: '6', label: 'Junio' },
        { value: '7', label: 'Julio' },
        { value: '8', label: 'Agosto' },
        { value: '9', label: 'Septiembre' },
        { value: '10', label: 'Octubre' },
        { value: '11', label: 'Noviembre' },
        { value: '12', label: 'Diciembre' }
    ];

    useEffect(() => {
        const db = getDatabase();
        const misionesRef = ref(db, 'fundacion/misionespecial');

        onValue(misionesRef, (snapshot) => {
            const misionesData = snapshot.val();
            const misionesArray = misionesData ? Object.values(misionesData) : [];
            setMisiones(misionesArray);
        });
    }, []);

    // Aquí se define misionesFiltradas correctamente
    const misionesFiltradas = misiones.filter(mision => {
        const fechaInicio = new Date(mision.fechaInicio);
        const mes = (fechaInicio.getMonth() + 1).toString(); // Obtener el mes de la fecha de inicio
        const ano = fechaInicio.getFullYear().toString(); // Obtener el año de la fecha de inicio

        return (filtroMes ? mes === filtroMes : true) && (filtroAno ? ano === filtroAno : true);
    });

    const handleExportToExcel = () => {
        const datosParaExportar = misionesFiltradas.map((mision, index) => {
            const misionData = {
                Nro: index + 1,
                Misión: mision.mision,
                "Fecha Inicio": format(new Date(mision.fechaInicio), "dd/MM/yyyy", { locale: es }),
                "Fecha Fin": format(new Date(mision.fechaFin), "dd/MM/yyyy", { locale: es }),
                Unidad: mision.unidad,
            };

            const patrullaData = mision.voluntarios.map((voluntario, idx) => ({
                [`Patrulla ${idx + 1} - Grado`]: voluntario.grado || 'N/A',
                [`Patrulla ${idx + 1} - Nombre`]: voluntario.nombre,
                [`Patrulla ${idx + 1} - Apellido Paterno`]: voluntario.apellidoPaterno,
                [`Patrulla ${idx + 1} - Apellido Materno`]: voluntario.apellidoMaterno,
                [`Patrulla ${idx + 1} - CI`]: voluntario.ci,
            }));

            return { ...misionData, ...Object.assign({}, ...patrullaData) };
        });

        const worksheet = XLSX.utils.json_to_sheet(datosParaExportar);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Misiones");
        XLSX.writeFile(workbook, "InformeMisiones.xlsx");
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate('/signin');
        } catch (error) {
            console.error('Error al cerrar sesión', error);
        }
    };

    const handleRowClick = (mision) => {
        setPatrulla(mision.voluntarios || []);
        setShowModal(true);
    };

    return (
        <div>
            <NavBar handleSignOut={handleSignOut} />
            <div className="informe-misiones-container">
                <h2 className="text-center mb-4">Informe de Misiones</h2>
                <div className="filters-container mb-3">
                    <Form.Control
                        as="select"
                        className="me-2"
                        value={filtroMes}
                        onChange={(e) => setFiltroMes(e.target.value)}
                    >
                        <option value="">Seleccionar Mes</option>
                        {meses.map((mes) => (
                            <option key={mes.value} value={mes.value}>{mes.label}</option>
                        ))}
                    </Form.Control>
                    <Form.Control
                        type="number"
                        placeholder="Filtrar por Año (e.g., 2024)"
                        className="me-2"
                        value={filtroAno}
                        onChange={(e) => setFiltroAno(e.target.value)}
                    />
                </div>
                <Table striped bordered hover responsive className="text-center">
                    <thead>
                        <tr>
                            <th>Nro</th>
                            <th>Misión</th>
                            <th>Fecha Inicio</th>
                            <th>Fecha Fin</th>
                            <th>Unidad</th>
                        </tr>
                    </thead>
                    <tbody>
                        {misionesFiltradas.map((mision, index) => (
                            <tr key={index} onClick={() => handleRowClick(mision)} style={{ cursor: 'pointer' }}>
                                <td>{index + 1}</td>
                                <td>{mision.mision}</td>
                                <td>{format(new Date(mision.fechaInicio), "dd/MM/yyyy", { locale: es })}</td>
                                <td>{format(new Date(mision.fechaFin), "dd/MM/yyyy", { locale: es })}</td>
                                <td>{mision.unidad}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                <div className="export-button-container">
                    <Button variant="success" onClick={handleExportToExcel}>Exportar a Excel</Button>
                </div>

              {/* Modal para mostrar la patrulla */}
              <Modal show={showModal} onHide={() => setShowModal(false)} centered dialogClassName="modal-wide">
    <Modal.Header closeButton>
        <Modal.Title>Detalles de la Patrulla</Modal.Title>
    </Modal.Header>
    <Modal.Body>
        {patrulla.length > 0 ? (
            <Table striped bordered hover className="table-modal">
                <thead>
                    <tr>
                    <th>Codigo</th>
                        <th>Grado</th>
                        
                        <th>Nombre</th>
                        <th>Apellido Paterno</th>
                        <th>Apellido Materno</th>
                       {/* <th>CI</th>*/}
                    </tr>
                </thead>
                <tbody>
                    {patrulla.map((voluntario, index) => (
                        <tr key={index}>
                             <td>{voluntario.codigo}</td>
                            <td>{voluntario.grado || 'N/A'}</td>
                           
                            <td>{voluntario.nombre}</td>
                            <td>{voluntario.apellidoPaterno}</td>
                            <td>{voluntario.apellidoMaterno}</td>
                            {/*  <td>{voluntario.ci}</td>*/}
                          
                        </tr>
                    ))}
                </tbody>
            </Table>
        ) : (
            <p>No hay información disponible de la patrulla.</p>
        )}
    </Modal.Body>
    <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cerrar
        </Button>
    </Modal.Footer>
</Modal>
            </div>
        </div>
    );
}

export default InformeMisiones;
