import React from 'react';
import { Link } from 'react-router-dom';
import './AdminEprDashboard.css';

function AdminEprDashboard() {
  return (
    <div className="admin-epr-dashboard-container">
      <h1>Dashboard de Administrador EPR</h1>
      <div className="admin-epr-options">
        <Link to="/Eventos" className="admin-epr-option">
          Registrar Eventos
        </Link>
        <Link to="/RegOp" className="admin-epr-option">
          Registrar Oportunidades
        </Link>
        <Link to="/registrarU" className="admin-epr-option">
          Registrar Unidad
        </Link>
        <Link to="/ListEvent" className="admin-epr-option">
          Listar Eventos
        </Link>
        <Link to="/ListOport" className="admin-epr-option">
          Listar Oportunidades
        </Link>
        <Link to="/listarUn" className="admin-epr-option">
          Listar Unidades
        </Link>
      </div>
    </div>
  );
}

export default AdminEprDashboard;
