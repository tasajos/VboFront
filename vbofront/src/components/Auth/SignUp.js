// Ejemplo básico de componente de registro
import React, { useState } from 'react';
import fire from '../../firebase';
import { auth } from '../../firebase';  

// Usar `auth` directamente, por ejemplo:
import { createUserWithEmailAndPassword } from 'firebase/auth';

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async (email, password) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log('Usuario registrado');
    } catch (error) {
      console.error('Error al registrar el usuario', error);
    }
  };

  return (
    <div>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email"/>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña"/>
      <button onClick={handleSignUp}>Registrar</button>
    </div>
  );
}

export default SignUp;
