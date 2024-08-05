import React, { useState } from 'react';
import { getDatabase, ref, set } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import NavBar from '../NavBar/navbar';
import './RegistrarUnidad.css'; // Asegúrate de que el archivo CSS esté importado correctamente
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';

function RegistrarUnidad() {
  const [tipoUnidad, setTipoUnidad] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [facebook, setFacebook] = useState('');
  const [imagen, setImagen] = useState(null);
  const [imagenUrl, setImagenUrl] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [web, setWeb] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [codigoPais, setCodigoPais] = useState('+591'); // Código de país predeterminado
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', body: '' });
  const [loading, setLoading] = useState(false);
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

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    setImagen(file);
    try {
      const storage = getStorage();
      const imageRef = storageRef(storage, `unidades/${file.name}`);
      const snapshot = await uploadBytes(imageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      setImagenUrl(url);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!tipoUnidad || !ciudad || !nombre || !telefono || !imagenUrl || !whatsapp) {
      setLoading(false);
      setModalContent({ title: 'Error de Registro', body: 'Por favor, completa todos los campos obligatorios.' });
      setShowModal(true);
      return;
    }

    try {
      const db = getDatabase();
      const unidadRef = ref(db, `${tipoUnidad}/${nombre}`);
      await set(unidadRef, {
        ciudad,
        facebook,
        imagen: imagenUrl,
        latitude: latitude || null,
        longitude: longitude || null,
        nombre,
        telefono,
        web,
        whatsapp: `${codigoPais}${whatsapp}`,
      });

      setCiudad('');
      setFacebook('');
      setImagen(null);
      setImagenUrl('');
      setLatitude('');
      setLongitude('');
      setNombre('');
      setTelefono('');
      setWeb('');
      setWhatsapp('');
      setLoading(false);
      setModalContent({ title: 'Registro Exitoso', body: 'La unidad ha sido registrada exitosamente.' });
      setShowModal(true);
    } catch (error) {
      let message = 'Ocurrió un error desconocido. Por favor, inténtalo de nuevo.';
      if (error.code === 'database/permission-denied') {
        message = 'No tienes permisos para escribir en la base de datos.';
      }
      setModalContent({ title: 'Error de Registro', body: message });
      setShowModal(true);
      setLoading(false);
    }
  };

  const handleDeleteImage = () => {
    setImagen(null);
    setImagenUrl('');
  };

  return (
    <div>
      <NavBar handleSignOut={handleSignOut} />
      <div className="background">
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tipo de Unidad:</label>
              <select value={tipoUnidad} onChange={(e) => setTipoUnidad(e.target.value)} className="form-control" required>
                <option value="">Seleccione una unidad</option>
                <option value="epr">EPR</option>
                <option value="educacion">Educación</option>
                <option value="animalistas">Animalistas</option>
                <option value="ambulancia">Ambulancia</option>
                <option value="ambientalistas">Ambientalistas</option>
              </select>
            </div>

            <div className="form-group">
              <label>Ciudad:</label>
              <select value={ciudad} onChange={(e) => setCiudad(e.target.value)} className="form-control" required>
                <option value="">Seleccione</option>
                <option value="La Paz">La Paz</option>
                <option value="Cochabamba">Cochabamba</option>
                <option value="Santa Cruz">Santa Cruz</option>
                <option value="Beni">Beni</option>
                <option value="Oruro">Oruro</option>
                <option value="Potosí">Potosí</option>
                <option value="Tarija">Tarija</option>
                <option value="Chuquisaca">Chuquisaca</option>
                <option value="Pando">Pando</option>
              </select>
            </div>

            <div className="form-group">
              <label>Facebook:</label>
              <input type="text" value={facebook} onChange={(e) => setFacebook(e.target.value)} className="form-control" />
            </div>

            <div className="form-group">
              <label>Imagen:</label>
              <input type="file" onChange={handleFileChange} className="form-control" required />
              {imagenUrl && (
                <div className="image-preview">
                  <img src={imagenUrl} alt="Preview" className="img-thumbnail" />
                  <button type="button" onClick={handleDeleteImage} className="btn btn-danger btn-sm">Eliminar Imagen</button>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Latitud (Opcional):</label>
              <input type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} className="form-control" />
            </div>

            <div className="form-group">
              <label>Longitud (Opcional):</label>
              <input type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} className="form-control" />
            </div>

            <div className="form-group">
              <label>Nombre:</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="form-control" required />
            </div>

            <div className="form-group">
              <label>Teléfono:</label>
              <input type="number" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="form-control" required />
            </div>

            <div className="form-group">
              <label>Web:</label>
              <input type="text" value={web} onChange={(e) => setWeb(e.target.value)} className="form-control" />
            </div>

            <div className="form-group">
              <label>WhatsApp:</label>
              <div className="input-group">
                <select value={codigoPais} onChange={(e) => setCodigoPais(e.target.value)} className="form-control" style={{ maxWidth: '120px' }}>
                  <option value="+591">+591</option>
                  <option value="+595">+595</option>
                  <option value="+1">+1</option>
                  <option value="+56">+56</option>
                  {/* Añadir más códigos de país según sea necesario */}
                </select>
                <input type="number" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="form-control" required />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Procesando...' : 'Registrar Unidad'}
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

export default RegistrarUnidad;
