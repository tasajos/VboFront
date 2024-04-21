import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import './App.css';
import SignUp from './components/Auth/SignUp';
import SignIn from './components/Login/SignIn';
import SituacionActual from './components/SituacionActual/Situacion';
import Dashboard from './components/Portal/Dashboard';
import Solicitudes from './components/Emergencias/Solicitudes/EmerSol';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={currentUser ? <Dashboard /> : <Navigate replace to="/signin" />}
          />
          <Route path="/signup" element={!currentUser ? <SignUp /> : <Navigate replace to="/" />} />
          <Route path="/signin" element={!currentUser ? <SignIn /> : <Navigate replace to="/" />} />
          <Route path="/situacion-actual" element={<SituacionActual />} />
          <Route path="/inicio" element={<Dashboard />} />
          <Route path="/solicitudes" element={<Solicitudes />} />
        </Routes>
      </div>
    </Router>
  );
}


export default App;
