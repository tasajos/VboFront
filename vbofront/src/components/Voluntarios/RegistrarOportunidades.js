import React, { useState, forwardRef } from 'react';
import { getDatabase, ref, push } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import NavBar from '../NavBar/navbar';
import './EventosV0.css'; // Asegúrate de que el archivo CSS esté importado correctamente
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // Usa useNavigate en lugar de Navigate
import { auth } from '../../firebase';

function RegistrarOportunidades() {
    const [cuerpo, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fecha, setFecha] = useState(new Date());
    const [imagen, setImagen] = useState(null);
    const [titulo, setTitulo] = useState('');
    const [link, setLink] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', body: '' });
    const [imagenCargada, setImagenCargada] = useState(false);
    const [loading, setLoading] = useState(false);
    const [estado, setEstado] = useState('Activo'); // Nuevo estado para la selección
    const navigate = useNavigate(); // Utiliza useNavigate

    const CustomInput = forwardRef(({ value, onClick }, ref) => (
        <input
            className="form-control"
            onClick={onClick}
            value={value}
            readOnly // Esto hará que el campo de entrada sea solo lectura
            ref={ref}
        />
    ));

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate('/signin'); // Redirigir al usuario después de cerrar sesión
            console.log('Sesión cerrada');
        } catch (error) {
            console.error('Error al cerrar sesión', error);
        }
    };

    function formatDate(date) {
        const d = new Date(date);
        const day = `${d.getDate()}`.padStart(2, '0');
        const month = `${d.getMonth() + 1}`.padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    }

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
        setLoading(true); // Inicia el indicador de carga
        if (!imagen) {
            setLoading(false); // Detiene el indicador de carga si no hay imagen
            setModalContent({ title: 'Error de Registro', body: 'Por favor, selecciona una imagen para el evento.' });
            setShowModal(true);
            return;
        }
        try {
            const storage = getStorage();
            const imageRef = storageRef(storage, `oportunidadesVoluntariado/${imagen.name}`);
            const snapshot = await uploadBytes(imageRef, imagen);
            const imageUrl = await getDownloadURL(snapshot.ref);
            const formattedDate = formatDate(fecha); // Asegúrate de usar esta fecha formateada
            const db = getDatabase();
            const newEventRef = ref(db, 'oportunidadesVoluntariado');
            await push(newEventRef, {
                cuerpo,
                descripcion,
                fecha: formattedDate,
                imagen: imageUrl,
                titulo,
                link,
                estado // Agregar estado al objeto que se sube a la base de datos
            });
            // Limpia los campos del formulario después de enviar los datos
            setNombre('');
            setDescripcion('');
            setFecha(new Date()); // Reinicia la fecha al valor inicial o a la fecha actual
            setImagen(null);
            setTitulo('');
            setLink('');
            setEstado('Activo'); // Reinicia el estado al valor predeterminado
            setImagenCargada(false); // Opcional: reinicia el estado de carga de la imagen
    
            setLoading(false);
            setModalContent({ title: 'Registro Exitoso', body: 'Oportunidades de Voluntariado ha sido creado exitosamente.' });
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
            setLoading(false);
        }
    };
    
    return (
        <div>
           <NavBar handleSignOut={handleSignOut} />
            <div className="background">
                <div className="form-container">
                    <form onSubmit={handleSubmit}>

                    <div className="form-group">
                            <label>Titulo:</label>
                            <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} className="form-control" />
                        </div>

                        <div className="form-group">
                            <label>Cuerpo:</label>
                            <input type="text" value={cuerpo} onChange={(e) => setNombre(e.target.value)} className="form-control" />
                        </div>
                        <div className="form-group">
                            <label>Descripción:</label>
                            <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="form-control" />
                        </div>
                      
                        <div className="form-group">
                        <label>Fecha:</label>
                        <DatePicker
                            selected={fecha}
                            onChange={(date) => setFecha(date)}
                            dateFormat="dd/MM/yyyy"
                            customInput={<CustomInput />}
                        />
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
                            <label>Estado:</label>
                            <select value={estado} onChange={(e) => setEstado(e.target.value)} className="form-control">
                                <option value="Activo">Activo</option>
                                <option value="Pendiente">Pendiente</option>
                                <option value="Vencido">Vencido</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Link:</label>
                            <input type="text" value={link} onChange={(e) => setLink(e.target.value)} className="form-control" />
                        </div>

                        <button type="submit" className="button" disabled={loading}>
                            {loading ? 'Procesando...' : 'Crear Oportunidades'}
                        </button>
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

export default RegistrarOportunidades;