import React, { useState, useEffect } from 'react';
import { getDatabase, ref, push, onValue, update } from 'firebase/database';
import { Table, Form, Button, Alert } from 'react-bootstrap';
import './Presupuesto.css';
import NavBar from '../../../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../../firebase';

function Presupuesto() {
    const [budgets, setBudgets] = useState([]); // Cambiado "presupuestos" a "budgets"
    const [expenses, setExpenses] = useState([]); // Cambiado "gastos" a "expenses"
    const [department, setDepartment] = useState(''); // Cambiado "departamento" a "department"
    const [project, setProject] = useState(''); // Cambiado "proyecto" a "project"
    const [budgetAmount, setBudgetAmount] = useState(''); // Cambiado "montoPresupuesto" a "budgetAmount"
    const [date, setDate] = useState(''); // Cambiado "fecha" a "date"
    const [alerts, setAlerts] = useState([]); // Cambiado "alertas" a "alerts"
    const [userUnit, setUserUnit] = useState(localStorage.getItem('userUnit') || ''); // Cambiado "unidadUsuario" a "userUnit"
    const navigate = useNavigate();
  
    useEffect(() => {
      const db = getDatabase();
      const budgetRef = ref(db, `fundacion/presupuestos/${userUnit}`);
      const expensesRef = ref(db, `fundacion/finanzas/${userUnit}/egresos`);
  
      // Obtener presupuestos
      onValue(budgetRef, (snapshot) => {
        const data = snapshot.val();
        const budgetsArray = data ? Object.entries(data).map(([id, value]) => ({ id, ...value })) : [];
        setBudgets(budgetsArray);
      });
  
      // Obtener gastos reales
      onValue(expensesRef, (snapshot) => {
        const data = snapshot.val();
        const expensesArray = data ? Object.entries(data).map(([id, value]) => ({ id, ...value })) : [];
        setExpenses(expensesArray);
      });
    }, [userUnit]);
  
    // Comparar presupuestos con gastos reales y generar alertas si es necesario
    useEffect(() => {
      const newAlerts = [];
      budgets.forEach((budget) => {
        const projectExpenses = expenses
          .filter((expense) => expense.project === budget.project)
          .reduce((acc, expense) => acc + expense.monto, 0);
  
        if (projectExpenses > budget.monto) {
          newAlerts.push(`El proyecto ${budget.project} ha excedido el presupuesto de ${budget.monto} Bs. Gastos actuales: ${projectExpenses} Bs.`);
        }
      });
      setAlerts(newAlerts);
    }, [expenses, budgets]);
  
    const handleRegisterBudget = () => {
      const db = getDatabase();
      const budgetRef = ref(db, `fundacion/presupuestos/${userUnit}`);
  
      push(budgetRef, {
        department,
        project,
        monto: parseFloat(budgetAmount),
        date,
        unidad: userUnit,
      }).then(() => {
        setDepartment('');
        setProject('');
        setBudgetAmount('');
        setDate('');
      });
    };
  
    const handleSignOut = async () => {
      try {
        await signOut(auth);
        navigate('/signin');
        console.log('Sesión cerrada');
      } catch (error) {
        console.error('Error al cerrar sesión', error);
      }
    };
  
    return (
      <div>
        <NavBar handleSignOut={handleSignOut} />
        <div className="budget-container">
          <h2>Registro de Presupuestos</h2>
  
          <Form>
            <Form.Group controlId="department" className="mt-3">
              <Form.Label>Departamento</Form.Label>
              <Form.Control
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Ingrese el departamento"
              />
            </Form.Group>
  
            <Form.Group controlId="project" className="mt-3">
              <Form.Label>Proyecto</Form.Label>
              <Form.Control
                type="text"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="Ingrese el nombre del proyecto"
              />
            </Form.Group>
  
            <Form.Group controlId="budgetAmount" className="mt-3">
              <Form.Label>Monto del Presupuesto (Bs)</Form.Label>
              <Form.Control
                type="number"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                placeholder="Ingrese el monto del presupuesto"
              />
            </Form.Group>
  
            <Form.Group controlId="date" className="mt-3">
              <Form.Label>Fecha</Form.Label>
              <Form.Control
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Form.Group>
  
            <Button variant="primary" className="mt-4" onClick={handleRegisterBudget}>
              Registrar Presupuesto
            </Button>
          </Form>
  
          <h3 className="mt-5">Presupuestos Registrados</h3>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Departamento</th>
                <th>Proyecto</th>
                <th>Monto (Bs)</th>
                <th>Fecha</th>
                <th>Unidad</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((budget) => (
                <tr key={budget.id}>
                  <td>{budget.department}</td>
                  <td>{budget.project}</td>
                  <td>{budget.monto}</td>
                  <td>{budget.date}</td>
                  <td>{budget.unidad}</td>
                </tr>
              ))}
            </tbody>
          </Table>
  
          <h3 className="mt-5">Alertas</h3>
          {alerts.length > 0 ? (
            alerts.map((alert, index) => (
              <Alert key={index} variant="danger">
                {alert}
              </Alert>
            ))
          ) : (
            <Alert variant="success">No hay alertas en este momento.</Alert>
          )}
        </div>
      </div>
    );
  }
  
export default Presupuesto;
