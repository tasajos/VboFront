import React, { useState, useEffect } from 'react';
import { auth, database } from '../../firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import './SignIn.css';  

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const accessDeniedMessage = localStorage.getItem('accessDenied');
    if (accessDeniedMessage) {
      setError(accessDeniedMessage);
      localStorage.removeItem('accessDenied');
    }
  }, []);

  const handleSignIn = async () => {
    setLoading(true);
    setError(''); // Limpiar errores previos
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
      const userRef = ref(database, `UsuariosVbo/${userId}`);
      const userSnapshot = await get(userRef);
      const userData = userSnapshot.val();
      
      if (userData.rol !== 'Administrador') {
        setAccessDenied(true); // Mostrar mensaje si el rol no es Administrador
        await signOut(auth); // Cerrar sesión si el usuario no es Administrador

        // Guardar mensaje en localStorage
        localStorage.setItem('accessDenied', 'No tienes el rol necesario para iniciar sesión.');

        // Esperar 10 segundos antes de redirigir al inicio de sesión
        setTimeout(() => {
          setAccessDenied(false);
          navigate('/signin');
        }, 10000);
      } else {
        console.log('Inicio de sesión exitoso');
        navigate('/dashboard'); // Redirigir al usuario al Dashboard después de un inicio de sesión exitoso
      }
    } catch (error) {
      console.error('Error en el inicio de sesión', error);
      setError('Usuario o contraseña incorrecta.'); // Personaliza tu mensaje de error
    }
    setLoading(false);
  };

  const handlePasswordReset = async () => {
    if (email) {
      try {
        await sendPasswordResetEmail(auth, email);
        alert('Se ha enviado un enlace para restablecer tu contraseña a tu correo electrónico.');
      } catch (error) {
        console.error('Error al enviar correo electrónico de restablecimiento de contraseña', error);
        alert('Error al enviar el correo electrónico de restablecimiento. Por favor verifica si el correo electrónico es correcto.');
      }
    } else {
      alert('Por favor ingresa tu correo electrónico.');
    }
  };

  if (initialLoad && accessDenied) {
    // Muestra mensaje de acceso denegado durante 10 segundos
    setTimeout(() => {
      setAccessDenied(false);
      setInitialLoad(false); // Asegura que el mensaje no se muestre nuevamente al recargar
    }, 10);
  }

  return (
    <div className="signin-container">
      <img src="/img/chlogotrans.png" alt="Logo" className="logo" />
      <h2>LOGIN</h2>
      {error && <p className="error-message">{error}</p>}
      {accessDenied && <p className="error-message">No tienes el rol necesario para iniciar sesión. Serás redirigido en 10 segundos.</p>}
      <form className="form-container" autoComplete="off">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="input-field"
          disabled={loading}
          autoComplete="off"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="input-field"
          disabled={loading}
          autoComplete="off"
        />
        <button onClick={handleSignIn} className="submit-btn" disabled={loading}>
          {loading ? 'Cargando...' : 'Iniciar sesión'}
        </button>
        <button onClick={handlePasswordReset} className="reset-btn">¿Olvidaste tu contraseña?</button>
      </form>
    </div>
  );
}

export default SignIn;
