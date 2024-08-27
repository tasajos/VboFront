import React, { useState, useEffect } from 'react';
import { getDatabase, ref, push, onValue, remove, update } from 'firebase/database';
import { auth } from '../../../firebase';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import Modal from 'react-bootstrap/Modal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import './ActividadesPersonal.css';
import NavBar from '../../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function ActividadesPersonal() {
 const [postContent, setPostContent] = useState('');
 const [posts, setPosts] = useState([]);
 const [userUnit, setUserUnit] = useState('');
 const [userName, setUserName] = useState('');
 const [postStatus, setPostStatus] = useState('Activo');
 const [error, setError] = useState('');
 const [showModal, setShowModal] = useState(false);
 const [modalMessage, setModalMessage] = useState('');
 const navigate = useNavigate();

 useEffect(() => {
   const user = auth.currentUser;
   if (user) {
     const db = getDatabase();
     const userRef = ref(db, `UsuariosVbo/${user.uid}`);
     onValue(userRef, (snapshot) => {
       const userData = snapshot.val();
       if (userData) {
         setUserUnit(userData.unidad || '');
         setUserName(userData.nombre || '');
         
         const postsRef = ref(db, 'fundacion/post');
         onValue(postsRef, (snapshot) => {
           const allPosts = snapshot.val();
           const filteredPosts = allPosts 
             ? Object.entries(allPosts)
                 .filter(([_, post]) => post.unidad === userData.unidad)
                 .map(([id, post]) => ({ id, ...post }))
             : [];
           setPosts(filteredPosts);
         });
       }
     });
   }
 }, []);

 const handleSignOut = async () => {
   try {
     await signOut(auth);
     navigate('/signin');
   } catch (error) {
     console.error('Error al cerrar sesión', error);
   }
 };

 const handlePost = () => {
   if (!postContent.trim()) {
     setError('El contenido del post no puede estar vacío.');
     return;
   }

   const db = getDatabase();
   const postRef = ref(db, 'fundacion/post');
   const newPost = {
     contenido: postContent,
     unidad: userUnit,
     usuario: userName,
     fecha: new Date().toISOString(),
     estado: postStatus,
   };

   push(postRef, newPost)
     .then(() => {
       setPostContent('');
       setPostStatus('Activo');
       setError('');
     })
     .catch(error => {
       console.error('Error al registrar el post:', error);
       setError('Hubo un error al registrar el post.');
     });
 };

 const handleDeletePost = (postId) => {
   const db = getDatabase();
   const postRef = ref(db, `fundacion/post/${postId}`);
   remove(postRef)
     .then(() => {
       console.log('Post eliminado');
     })
     .catch(error => {
       console.error('Error al eliminar el post:', error);
     });
 };

 const handleUpdateStatus = (postId, newStatus) => {
   const db = getDatabase();
   const postRef = ref(db, `fundacion/post/${postId}`);
 
   update(postRef, { estado: newStatus })
     .then(() => {
       console.log('Estado actualizado');
       setModalMessage(`El estado ha sido cambiado a ${newStatus}`);
       setShowModal(true);
     })
     .catch(error => {
       console.error('Error al actualizar el estado:', error);
     });
 };

 return (
   <div>
     <NavBar handleSignOut={handleSignOut} />
     <div className="actividades-personal-container">
       <div className="actividades-personal-wrapper">
         <h2 className="text-center mb-4">Actividades del Personal</h2>
         <Form>
           <Form.Group controlId="postContent">
             <Form.Label>Nuevo Post:</Form.Label>
             <Form.Control
               as="textarea"
               rows={3}
               value={postContent}
               onChange={(e) => setPostContent(e.target.value)}
               placeholder="¿Qué está pasando?"
             />
           </Form.Group>
           <Form.Group controlId="postStatus" className="mt-3">
             <Form.Label>Estado:</Form.Label>
             <Form.Control
               as="select"
               value={postStatus}
               onChange={(e) => setPostStatus(e.target.value)}
             >
               <option value="Activo">Activo</option>
               <option value="Pasivo">Pasivo</option>
               <option value="Reserva">Reserva</option>
             </Form.Control>
           </Form.Group>
           {error && <p className="text-danger">{error}</p>}
           <Button variant="primary" className="mt-3" onClick={handlePost}>
             Registrar Post
           </Button>
         </Form>

         <h3 className="mt-5">Posts</h3>
         <div className="posts-list">
           {posts.length > 0 ? (
             posts.map((post, index) => (
               <Card key={index} className="mb-3">
                 <Card.Body>
                   <Card.Text>{post.contenido}</Card.Text>
                   <div className="post-meta">
                     <span className="post-user">{post.usuario}</span> ·{' '}
                     <span className="post-date">
                       {format(new Date(post.fecha), "dd/MM/yyyy HH:mm:ss", { locale: es })}
                     </span> ·{' '}
                     <span className={`post-status post-status-${(post.estado || 'Activo').toLowerCase()}`}>
                       {post.estado || 'Activo'}
                     </span>
                   </div>
                   <div className="d-flex justify-content-end mt-2">
                     <Button variant="success" size="sm" onClick={() => handleUpdateStatus(post.id, 'Activo')}>Activo</Button>
                     <Button variant="warning" size="sm" className="ms-2" onClick={() => handleUpdateStatus(post.id, 'Pasivo')}>Pasivo</Button>
                     <Button variant="secondary" size="sm" className="ms-2" onClick={() => handleUpdateStatus(post.id, 'Reserva')}>Reserva</Button>
                     <Button variant="danger" size="sm" className="ms-2" onClick={() => handleDeletePost(post.id)}>Eliminar</Button>
                   </div>
                 </Card.Body>
               </Card>
             ))
           ) : (
             <p>No hay posts disponibles.</p>
           )}
         </div>
       </div>
     </div>

     <Modal
       show={showModal}
       onHide={() => setShowModal(false)}
       centered
       backdrop="static"
     >
       <Modal.Header closeButton>
         <Modal.Title>Cambio de Estado</Modal.Title>
       </Modal.Header>
       <Modal.Body>
         <p>{modalMessage}</p>
       </Modal.Body>
       <Modal.Footer>
         <Button variant="primary" onClick={() => setShowModal(false)}>
           Cerrar
         </Button>
       </Modal.Footer>
     </Modal>
   </div>
 );
}

export default ActividadesPersonal;