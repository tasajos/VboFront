import React, { useState, useEffect, useCallback } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { Button, Form, Table } from 'react-bootstrap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import './InformeFinanciero.css';
import NavBar from '../../../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../../firebase';

function InformeFinanciero() {
  const [ingresos, setIngresos] = useState([]);
  const [egresos, setEgresos] = useState([]);
  const [periodo, setPeriodo] = useState('mensual'); // mensual o anual
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [balance, setBalance] = useState(0);
  const [unidadUsuario, setUnidadUsuario] = useState(localStorage.getItem('userUnit') || ''); // Añadir unidad del usuario autenticado
  const navigate = useNavigate();

  useEffect(() => {
    const db = getDatabase();
    const ingresosRef = ref(db, `fundacion/finanzas/${unidadUsuario}/ingresos`);
    const egresosRef = ref(db, `fundacion/finanzas/${unidadUsuario}/egresos`);

    // Obtener ingresos
    onValue(ingresosRef, (snapshot) => {
      const data = snapshot.val();
      const ingresosArray = data ? Object.entries(data).map(([id, value]) => ({ id, ...value })) : [];
      setIngresos(ingresosArray);
    });

    // Obtener egresos
    onValue(egresosRef, (snapshot) => {
      const data = snapshot.val();
      const egresosArray = data ? Object.entries(data).map(([id, value]) => ({ id, ...value })) : [];
      setEgresos(egresosArray);
    });
  }, [unidadUsuario]);

  const calcularBalance = useCallback(() => {
    let ingresosFiltrados = ingresos;
    let egresosFiltrados = egresos;

    // Filtrar por mes y año
    if (periodo === 'mensual') {
      ingresosFiltrados = ingresos.filter(
        (ingreso) => new Date(ingreso.fecha).getMonth() + 1 === parseInt(month) && new Date(ingreso.fecha).getFullYear() === parseInt(year)
      );
      egresosFiltrados = egresos.filter(
        (egreso) => new Date(egreso.fecha).getMonth() + 1 === parseInt(month) && new Date(egreso.fecha).getFullYear() === parseInt(year)
      );
    } else if (periodo === 'anual') {
      ingresosFiltrados = ingresos.filter(
        (ingreso) => new Date(ingreso.fecha).getFullYear() === parseInt(year)
      );
      egresosFiltrados = egresos.filter(
        (egreso) => new Date(egreso.fecha).getFullYear() === parseInt(year)
      );
    }

    const totalIngresos = ingresosFiltrados.reduce((acc, ingreso) => acc + ingreso.monto, 0);
    const totalEgresos = egresosFiltrados.reduce((acc, egreso) => acc + egreso.monto, 0);

    setBalance(totalIngresos - totalEgresos);
  }, [ingresos, egresos, periodo, month, year]);

  useEffect(() => {
    calcularBalance();
  }, [calcularBalance]);

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Reporte Financiero (${periodo})`, 20, 20);

    autoTable(doc, {
      head: [['Tipo', 'Fecha', 'Descripción', 'Monto', 'Moneda', 'Unidad']],
      body: [
        ...ingresos.map((ingreso) => ['Ingreso', ingreso.fecha, ingreso.descripcion, ingreso.monto, ingreso.moneda, ingreso.unidad]),
        ...egresos.map((egreso) => ['Egreso', egreso.fecha, egreso.descripcion, egreso.monto, egreso.moneda, egreso.unidad]),
      ],
    });

    doc.text(`Balance: ${balance}`, 20, doc.autoTable.previous.finalY + 20);
    doc.save('reporte_financiero.pdf');
  };

  const exportToExcel = () => {
    const data = [
      ...ingresos.map((ingreso) => ({
        Tipo: 'Ingreso',
        Fecha: ingreso.fecha,
        Descripción: ingreso.descripcion,
        Monto: ingreso.monto,
        Moneda: ingreso.moneda,
        Unidad: ingreso.unidad,
      })),
      ...egresos.map((egreso) => ({
        Tipo: 'Egreso',
        Fecha: egreso.fecha,
        Descripción: egreso.descripcion,
        Monto: egreso.monto,
        Moneda: egreso.moneda,
        Unidad: egreso.unidad,
      })),
    ];

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte Financiero');
    XLSX.writeFile(wb, 'reporte_financiero.xlsx');
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/signin');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

  return (
    <div>
      <NavBar handleSignOut={handleSignOut} />
      <div className="informe-financiero-container">
        <h2>Informe Financiero</h2>

        <Form.Group className="mt-3">
          <Form.Label>Periodo</Form.Label>
          <Form.Control as="select" value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
            <option value="mensual">Mensual</option>
            <option value="anual">Anual</option>
          </Form.Control>
        </Form.Group>

        {periodo === 'mensual' && (
          <Form.Group className="mt-3">
            <Form.Label>Mes</Form.Label>
            <Form.Control
              as="select"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('es', { month: 'long' })}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        )}

        <Form.Group className="mt-3">
          <Form.Label>Año</Form.Label>
          <Form.Control
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </Form.Group>

        <h3 className="mt-4">Balance: {balance} Bs</h3>

        <div className="d-flex justify-content-start mt-4">
          <Button variant="success" onClick={exportToPDF}>
            Descargar como PDF
          </Button>
          <Button variant="primary" className="ms-3" onClick={exportToExcel}>
            Descargar como Excel
          </Button>
        </div>

        <h3 className="mt-5">Detalles de Ingresos y Egresos</h3>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Fecha</th>
              <th>Descripción</th>
              <th>Monto</th>
              <th>Moneda</th>
              <th>Unidad</th> {/* Mostrar la unidad */}
            </tr>
          </thead>
          <tbody>
            {ingresos.map((ingreso) => (
              <tr key={ingreso.id}>
                <td>Ingreso</td>
                <td>{ingreso.fecha}</td>
                <td>{ingreso.descripcion}</td>
                <td>{ingreso.monto}</td>
                <td>{ingreso.moneda}</td>
                <td>{ingreso.unidad}</td> {/* Mostrar la unidad */}
              </tr>
            ))}
            {egresos.map((egreso) => (
              <tr key={egreso.id}>
                <td>Egreso</td>
                <td>{egreso.fecha}</td>
                <td>{egreso.descripcion}</td>
                <td>{egreso.monto}</td>
                <td>{egreso.moneda}</td>
                <td>{egreso.unidad}</td> {/* Mostrar la unidad */}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

export default InformeFinanciero;
