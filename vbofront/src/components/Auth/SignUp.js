import React, { useState } from 'react';
import { auth } from '../../firebase';  
import { createUserWithEmailAndPassword } from 'firebase/auth';
import './SignUp.css';  // Asegúrate de crear este archivo de estilos CSS

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log('Usuario registrado');
    } catch (error) {
      console.error('Error al registrar el usuario', error);
    }
  };

  return (
    <div className="signup-container">
      <img src="path/to/your/logo.png" alt="Logo de la Empresa" className="logo" />
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
        <button onClick={handleSignUp} className="submit-btn">Registrar</button>
      </div>
    </div>
  );
}

export default SignUp;
