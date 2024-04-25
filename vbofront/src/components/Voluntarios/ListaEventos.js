import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import './ListaEventos.css'; // Importa los estilos específicos para este componente
import NavBar from '../NavBar/navbar';

function ListaEventos() {
    const [eventos, setEventos] = useState([]);

    useEffect(() => {
        const db = getDatabase();
        const eventosRef = ref(db, 'eventos');

        const unsubscribe = onValue(eventosRef, (snapshot) => {
            const data = snapshot.val();
            const eventosLista = data ? Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            })) : [];
            setEventos(eventosLista);
        }, {
            onlyOnce: true
        });

        return () => unsubscribe();
    }, []);

    return (
        <div>
            <NavBar />
        <div className="tabla-eventos-container">
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
                    {eventos.map(evento => (
                        <tr key={evento.id}>
                            <td>{evento.nombre}</td>
                            <td>{evento.descripcion}</td>
                            <td>{evento.fecha}</td>
                            <td>{evento.estado}</td>
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