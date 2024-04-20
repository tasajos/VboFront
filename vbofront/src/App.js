import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import SignUp from './components/Auth/SignUp';
import SignIn from './components/Login/SignIn';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
        <Route path="/" element={<Navigate replace to="/signin" />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          {/* Puedes añadir más rutas según necesites */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
