import React, { useState } from 'react';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import './SignIn.css';  

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Inicio de sesión exitoso');
    } catch (error) {
      console.error('Error en el inicio de sesión', error);
    }
  };

  return (
    <div className="signin-container">
     <img src="/img/chlogotrans.png" alt="chakuy" className="logo" />
        <h2>INICIAR SESION</h2>

      <div className="form-container">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="input-field"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="input-field"
        />
        <button onClick={handleSignIn} className="submit-btn">Iniciar sesión</button>
      </div>
    </div>
  );
}

export default SignIn;
