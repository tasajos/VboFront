import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import NavBar from '../../NavBar/navbar';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../firebase';
import Form from 'react-bootstrap/Form';
import './InformeLibroNovedades.css';

function InformeLibroNovedades() {
  const [novedades, setNovedades] = useState([]);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [unidad, setUnidad] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unidadAutenticada = localStorage.getItem('userUnit');
    setUnidad(unidadAutenticada || '');
  }, []);

  useEffect(() => {
    if (selectedDay && selectedMonth && selectedYear && unidad) {
      const db = getDatabase();
      const novedadesRef = ref(db, `libroNovedadesOficial/${unidad}`);
      const personalRef = ref(db, 'fundacion/personal');

      onValue(novedadesRef, (snapshot) => {
        const novedadesData = snapshot.val();
        if (novedadesData) {
          const novedadesArray = Object.values(novedadesData).filter((novedad) => {
            const novedadFecha = new Date(novedad.fecha);
            return (
              novedadFecha.getUTCFullYear() === parseInt(selectedYear) &&
              novedadFecha.getUTCMonth() === parseInt(selectedMonth) - 1 &&
              novedadFecha.getUTCDate() === parseInt(selectedDay)
            );
          });

          onValue(personalRef, (personalSnapshot) => {
            const personalData = personalSnapshot.val() || {};
            const detailedNovedades = novedadesArray.map((novedad) => {
              const oficial = personalData[novedad.oficialDeGuardia] || {};
              const firmaData = personalData[novedad.firma] || {};
              const voluntarios = (novedad.voluntariosServicio || []).map((ci) => personalData[ci] || {});

              return {
                ...novedad,
                oficialDeGuardia: `${oficial.grado || ''} ${oficial.nombre || ''} ${oficial.apellidoPaterno || ''} ${oficial.apellidoMaterno || ''}`,
                voluntariosServicio: voluntarios.map((v, idx) => ({
                  numero: idx + 1,
                  detalle: `${v.grado || ''} ${v.nombre || ''} ${v.apellidoPaterno || ''} ${v.apellidoMaterno || ''}`,
                })),
                firma: `${firmaData.grado || ''} ${firmaData.nombre || ''} ${firmaData.apellidoPaterno || ''} ${firmaData.apellidoMaterno || ''}`,
              };
            });
            setNovedades(detailedNovedades);
          });
        } else {
          setNovedades([]);
        }
      });
    }
  }, [selectedDay, selectedMonth, selectedYear, unidad]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/signin');
      console.log('Sesión cerrada');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

  const generateDays = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  return (
    <div>
      <NavBar handleSignOut={handleSignOut} />
      <div className="container-fluid informe-libro-novedades-container">
        <h2 className="informe-libro-novedades-header text-center">Informe del Libro de Novedades</h2>

        <div className="row date-selector">
          <div className="col-12 col-sm-4 mb-3">
            <Form.Group>
              <Form.Label>Seleccionar Año</Form.Label>
              <Form.Control
                as="select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="form-select"
              >
                <option value="">Seleccione un año</option>
                <option value="2023">2023</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </Form.Control>
            </Form.Group>
          </div>

          <div className="col-12 col-sm-4 mb-3">
            <Form.Group>
              <Form.Label>Seleccionar Mes</Form.Label>
              <Form.Control
                as="select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="form-select"
              >
                <option value="">Seleccione un mes</option>
                <option value="1">Enero</option>
                <option value="2">Febrero</option>
                <option value="3">Marzo</option>
                <option value="4">Abril</option>
                <option value="5">Mayo</option>
                <option value="6">Junio</option>
                <option value="7">Julio</option>
                <option value="8">Agosto</option>
                <option value="9">Septiembre</option>
                <option value="10">Octubre</option>
                <option value="11">Noviembre</option>
                <option value="12">Diciembre</option>
              </Form.Control>
            </Form.Group>
          </div>

          <div className="col-12 col-sm-4 mb-3">
            <Form.Group>
              <Form.Label>Seleccionar Día</Form.Label>
              <Form.Control
                as="select"
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="form-select"
              >
                <option value="">Seleccione un día</option>
                {selectedMonth && selectedYear && generateDays().map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </Form.Control>
            </Form.Group>
          </div>
        </div>

        {novedades.length > 0 ? (
          <div className="novedades-hoja">
            <div className="novedades-encabezado">
              <h3>Unidad: {unidad}</h3>
              <h4>Fecha: {`${selectedDay}/${selectedMonth}/${selectedYear}`}</h4>
            </div>
            <div className="novedades-cuerpo">
              {novedades.map((novedad, index) => (
                <div key={index} className="novedad-item mb-3 p-3 border rounded">
                  <p><strong>Turno:</strong> {novedad.turno}</p>
                  <h5>Oficial de Guardia: {novedad.oficialDeGuardia}</h5>
                  <p><strong>Voluntarios de Servicio:</strong></p>
                  <ul>
                    {(novedad.voluntariosServicio || []).map((voluntario, idx) => (
                      <li key={idx}>{voluntario.numero}. {voluntario.detalle}</li>
                    ))}
                  </ul>
                  <p><strong>Vehículos:</strong> {(novedad.vehiculos || []).join(', ')}</p>
                  <p><strong>Inventario:</strong> {novedad.inventario}</p>
                  <p><strong>Novedades:</strong></p>
                  <ul>
                    {(novedad.novedades || []).map((nov, idx) => (
                      <li key={idx}>{nov.hora} - {nov.descripcion}</li>
                    ))}
                  </ul>
                  <p><strong>Firma:</strong> {novedad.firma}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p>No hay novedades para la fecha seleccionada.</p>
        )}
      </div>
    </div>
  );
}

export default InformeLibroNovedades;
