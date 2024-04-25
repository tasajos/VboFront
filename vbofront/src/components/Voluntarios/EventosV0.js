import React, { useState } from 'react';
import { getDatabase, ref, push } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import NavBar from '../NavBar/navbar';
import './EventosV0.css'; // Asegúrate de que el archivo CSS esté importado correctamente

function EventosV0() {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [estado, setEstado] = useState('Activo');
    const [fecha, setFecha] = useState(new Date());
    const [imagen, setImagen] = useState(null);
    const [inscripcion, setInscripcion] = useState('');
    const [link, setLink] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', body: '' });
    const [imagenCargada, setImagenCargada] = useState(false);

    const handleFileChange = async (event) => {
        setImagen(event.target.files[0]);
        setImagenCargada(false); // Resetear el estado de imagen cargada al seleccionar una nueva imagen

        try {
            const storage = getStorage();
            const imageRef = storageRef(storage, `eventos/${event.target.files[0].name}`);
            const snapshot = await uploadBytes(imageRef, event.target.files[0]);
            const imageUrl = await getDownloadURL(snapshot.ref);

            setImagenCargada(true); // Marcar la imagen como cargada con éxito
        } catch (error) {
            setImagenCargada(false); // Marcar la imagen como no cargada en caso de error
            let message = 'Ocurrió un error desconocido. Por favor, inténtalo de nuevo.';
            if (error.code === 'storage/unauthorized') {
                message = 'No tienes permisos para subir imágenes.';
            } else if (error.code === 'storage/canceled') {
                message = 'La subida de la imagen fue cancelada.';
            }
            setModalContent({ title: 'Error de Registro', body: message });
            setShowModal(true);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imagen) {
            setModalContent({ title: 'Error de Registro', body: 'Por favor, selecciona una imagen para el evento.' });
            setShowModal(true);
            return;
        }
        try {
            const storage = getStorage();
            const imageRef = storageRef(storage, `eventos/${imagen.name}`);
            const snapshot = await uploadBytes(imageRef, imagen);
            const imageUrl = await getDownloadURL(snapshot.ref);
    
            const db = getDatabase();
            const newEventRef = ref(db, 'eventos');
            await push(newEventRef, {
                nombre,
                descripcion,
                estado,
                fecha: fecha.toISOString(),
                imagen: imageUrl,
                inscripcion,
                link
            });
    
            setModalContent({ title: 'Registro Exitoso', body: 'El evento ha sido creado exitosamente.' });
            setShowModal(true);
        } catch (error) {
            let message = 'Ocurrió un error desconocido. Por favor, inténtalo de nuevo.';
            if (error.code === 'storage/unauthorized') {
                message = 'No tienes permisos para subir imágenes.';
            } else if (error.code === 'storage/canceled') {
                message = 'La subida de la imagen fue cancelada.';
            }
            setModalContent({ title: 'Error de Registro', body: message });
            setShowModal(true);
        }
    };

    return (
        <div>
            <NavBar />
            <div className="background">
                <div className="form-container">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Nombre:</label>
                            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="form-control" />
                        </div>
                        <div className="form-group">
                            <label>Descripción:</label>
                            <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="form-control" />
                        </div>
                        <div className="form-group">
                            <label>Estado:</label>
                            <select value={estado} onChange={(e) => setEstado(e.target.value)} className="form-control">
                                <option value="Activo">Activo</option>
                                <option value="Vencido">Vencido</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Fecha y Hora:</label>
                            <DatePicker selected={fecha} onChange={(date) => setFecha(date)} showTimeSelect dateFormat="Pp" className="form-control" />
                        </div>
                        <div className="form-group">
                         <label>Imagen:</label>
                        <div className="custom-file">
                        <input type="file" className="custom-file-input" id="customFile" onChange={handleFileChange} />
                        {/* Asegúrate de que htmlFor coincida con el id del input */}
                        <label className="custom-file-label" htmlFor="customFile">Seleccionar archivo</label>
                        </div>
                        {imagenCargada && <p className="imagen-cargada-alerta">La imagen se ha cargado correctamente.</p>}
                        <small id="fileHelp" className="form-text text-muted">Formatos permitidos: jpg, png, gif</small>
                        </div>
                        
                        <div className="form-group">
                            <label>Inscripción:</label>
                            <input type="text" value={inscripcion} onChange={(e) => setInscripcion(e.target.value)} className="form-control" />
                        </div>
                        <div className="form-group">
                            <label>Link:</label    ><input type="text" value={link} onChange={(e) => setLink(e.target.value)} className="form-control" />
                        </div>
                        <button type="submit" className="button">Crear Evento</button>
                    </form>
                    <Modal show={showModal} onHide={() => setShowModal(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>{modalContent.title}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>{modalContent.body}</Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowModal(false)}>Cerrar</Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div>
        </div>
    );
}

export default EventosV0;
