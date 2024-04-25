import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, off, update } from 'firebase/database';
import './ListaOportunidades.css';
import NavBar from '../NavBar/navbar';

function ListaOportunidades() {
    const [oportunidades, setOportunidades] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        const db = getDatabase();
        const oportunidadesRef = ref(db, 'oportunidadesVoluntariado');

        const unsubscribe = onValue(oportunidadesRef, (snapshot) => {
            const data = snapshot.val();
            const oportunidadesLista = data ? Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            })).filter(op => op.estado === "Activo") : [];
            setOportunidades(oportunidadesLista);
        });

        return () => unsubscribe();
    }, []);

    const actualizarEstado = (id, nuevoEstado) => {
        const db = getDatabase();
        const oportunidadRef = ref(db, `oportunidadesVoluntariado/${id}`);

        update(oportunidadRef, { estado: nuevoEstado })
            .then(() => {
                setMensaje('Estado actualizado correctamente.');
                setTimeout(() => {
                    setMensaje('');
                    window.location.reload(); // Recargar la página para reflejar los cambios
                }, 1000);
            })
            .catch(error => {
                console.error("Error al actualizar el estado:", error);
                setMensaje('Error al actualizar el estado.');
                setTimeout(() => setMensaje(''), 3000);
            });
    };

    const oportunidadesFiltradas = oportunidades.filter(oportunidad =>
        (oportunidad.titulo && oportunidad.titulo.toLowerCase().includes(busqueda.toLowerCase())) ||
        (oportunidad.descripcion && oportunidad.descripcion.toLowerCase().includes(busqueda.toLowerCase())) ||
        (oportunidad.fecha && oportunidad.fecha.toLowerCase().includes(busqueda.toLowerCase()))
    );

    return (
        <div>
            <NavBar />
            <div className="tabla-oportunidades-container">
                {mensaje && <div className="alert">{mensaje}</div>}
                <input
                    type="text"
                    placeholder="Buscar oportunidades..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="search-input"
                />
                <table className="tabla-oportunidades">
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Cuerpo</th>
                            <th>Descripción</th>
                            <th>Fecha</th>
                            <th>Estado</th>
                            <th>Imagen</th>
                            <th>Link</th>
                        </tr>
                    </thead>
                    <tbody>
                        {oportunidadesFiltradas.map(oportunidad => (
                            <tr key={oportunidad.id}>
                                <td>{oportunidad.titulo}</td>
                                <td>{oportunidad.cuerpo}</td>
                                <td>{oportunidad.descripcion}</td>
                                <td>{oportunidad.fecha}</td>
                                <td>
                                    <select
                                        value={oportunidad.estado}
                                        onChange={(e) => actualizarEstado(oportunidad.id, e.target.value)}
                                    >
                                        <option value="Activo">Activo</option>
                                        <option value="Vencido">Vencido</option>
                                        <option value="Atendido">Atendido</option>
                                    </select>
                                </td>
                                <td><img src={oportunidad.imagen} alt={oportunidad.titulo} style={{ height: '30px', width: 'auto' }} /></td>
                                <td><a href={oportunidad.link} target="_blank" rel="noopener noreferrer">Ver más</a></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ListaOportunidades;
