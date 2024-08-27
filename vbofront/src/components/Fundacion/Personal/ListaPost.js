import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import Card from 'react-bootstrap/Card';
import NavBar from '../../NavBar/navbar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import './ListaPost.css';

function ListaPosts() {
  const [posts, setPosts] = useState([]);
  const [userUnit, setUserUnit] = useState('');

  useEffect(() => {
    const unidadAutenticada = localStorage.getItem('userUnit');
    setUserUnit(unidadAutenticada);
    fetchPosts(unidadAutenticada);
  }, []);

  const fetchPosts = (unidad) => {
    const db = getDatabase();
    const postsRef = ref(db, 'fundacion/post');

    onValue(postsRef, (snapshot) => {
      const postsData = snapshot.val();
      const filteredPosts = postsData
        ? Object.values(postsData)
            .filter((post) => post.unidad === unidad && post.estado === 'Activo')
        : [];
      setPosts(filteredPosts);
    });
  };

  return (
    <div>
     
      <div className="lista-posts-container">
        <h2 className="lista-posts-header">Noticias</h2>
        <div className="lista-posts-wrapper">
          {posts.length > 0 ? (
            posts.map((post, index) => (
              <Card key={index} className="post-card mb-3">
                <Card.Body>
                  <Card.Text className="post-text">
                    {post.contenido}
                  </Card.Text>
                  <div className="post-footer">
                    <span className="post-user">
                      {post.usuario} {/* Nombre del usuario que hizo el post */}
                    </span>
                    <span className="post-date">
                      {format(new Date(post.fecha), "dd/MM/yyyy HH:mm", { locale: es })}
                    </span>
                  </div>
                </Card.Body>
              </Card>
            ))
          ) : (
            <p>No hay publicaciones activas para mostrar.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ListaPosts;