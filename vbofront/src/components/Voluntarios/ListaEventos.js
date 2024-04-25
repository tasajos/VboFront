import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, off, update } from 'firebase/database';
import './ListaEventos.css';
import NavBar from '../NavBar/navbar';

function ListaEventos() {
    const [eventos, setEventos] = useState([]);
    const [busqueda, setBusqueda] = useState(''); // Estado para almacenar el término de búsqueda
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        const db = getDatabase();
        const eventosRef = ref(db, 'eventos');

        const unsubscribe = onValue(eventosRef, (snapshot) => {
            const data = snapshot.val();
            const eventosLista = data ? Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            })).filter(evento => evento.estado === "Activo") : []; // Filtrar solo eventos activos
            setEventos(eventosLista);
        });

        return () => unsubscribe();
    }, []);

    const actualizarEstado = (id, nuevoEstado) => {
        const db = getDatabase();
        const eventoRef = ref(db, `eventos/${id}`);

        update(eventoRef, { estado: nuevoEstado })
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

    // Función para filtrar eventos según el término de búsqueda
    const eventosFiltrados = eventos.filter(evento =>
        evento.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        evento.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
        evento.fecha.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div>
            <NavBar />
            <div className="tabla-eventos-container">
                {mensaje && <div className="alert">{mensaje}</div>}
                <input
                    type="text"
                    placeholder="Buscar eventos..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="search-input"
                />
                <table className="tabla-eventos">
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Descripción</th>
                            <th>Fecha</th>
                            <th>Estado</th>
                            <th>Imagen</th>
                            <th>Link</th>
                        </tr>
                    </thead>
                    <tbody>
                        {eventosFiltrados.map(evento => (
                            <tr key={evento.id}>
                                <td>{evento.nombre}</td>
                                <td>{evento.descripcion}</td>
                                <td>{evento.fecha}</td>
                                <td>
                                    <select
                                        value={evento.estado}
                                        onChange={(e) => actualizarEstado(evento.id, e.target.value)}
                                    >
                                        <option value="Activo">Activo</option>
                                        <option value="Vencido">Vencido</option>
                                        <option value="Atendido">Atendido</option>
                                    </select>
                                </td>
                                <td><img src={evento.imagen} alt={evento.nombre} /></td>
                                <td><a href={evento.link} target="_blank" rel="noopener noreferrer">Ver más</a></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ListaEventos;
