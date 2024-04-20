import React, { useState } from 'react';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword ,sendPasswordResetEmail} from 'firebase/auth';
import './SignIn.css';  

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    setError(''); // Limpiar errores previos
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Inicio de sesión exitoso');
      // Aquí también podrías redirigir al usuario al Dashboard después de un inicio de sesión exitoso
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

  return (
    <div className="signin-container">
      <img src="/img/chlogotrans.png" alt="Logo" className="logo" />
      <h2>LOGIN</h2>
      {error && <p className="error-message">{error}</p>}
      <div className="form-container">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="input-field"
          disabled={loading}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="input-field"
          disabled={loading}
        />
        <button onClick={handleSignIn} className="submit-btn" disabled={loading}>
          {loading ? 'Cargando...' : 'Iniciar sesión'}
        </button>
        <button onClick={handlePasswordReset} className="reset-btn">¿Olvidaste tu contraseña?</button>
      </div>
    </div>
  );
}

export default SignIn;
