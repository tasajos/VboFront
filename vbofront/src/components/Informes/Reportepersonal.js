import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import Card from 'react-bootstrap/Card';
import './ReportePersonal.css'; // Ensure this file is created for custom styling
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import NavBar from '../NavBar/navbar';

const ReportePersonal = () => {
  const [eventData, setEventData] = useState([]);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/signin');
      console.log('Sesión cerrada');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

  useEffect(() => {
    const db = getDatabase();
    const formRef = ref(db, 'formulariosci/211');

    onValue(formRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Process data to group by date and institution
        const processedData = processEventData(data);
        setEventData(processedData);
      }
    });
  }, []);

  const processEventData = (data) => {
    const result = {};

    Object.values(data).forEach((entry) => {
      const { nombreIncidente, fechaHora, registroPersonal } = entry;
      const dateKey = new Date(fechaHora).toLocaleDateString();

      if (!result[dateKey]) {
        result[dateKey] = {};
      }

      if (!result[dateKey][nombreIncidente]) {
        result[dateKey][nombreIncidente] = { total: 0, institutions: {} };
      }

      registroPersonal.forEach(({ institucion }) => {
        if (!result[dateKey][nombreIncidente].institutions[institucion]) {
          result[dateKey][nombreIncidente].institutions[institucion] = 0;
        }
        result[dateKey][nombreIncidente].institutions[institucion]++;
        result[dateKey][nombreIncidente].total++;
      });
    });

    return result;
  };

  const getInstitutionColor = (institution) => {
    const colors = [
      '#f8d7da', // Color 1
      '#d4edda', // Color 2
      '#d1ecf1', // Color 3
      '#fff3cd', // Color 4
      '#e2e3e5', // Default color
    ];
    // Assign a color based on institution name length
    const index = institution.length % colors.length;
    return colors[index];
  };

  return (
    <div>
      <NavBar handleSignOut={handleSignOut} />
      <div className="event-personnel-container">
        {Object.entries(eventData).map(([date, events]) => (
          <div key={date} className="date-section">
            <h3>{date}</h3>
            {Object.entries(events).map(([event, { total, institutions }]) => (
              <div key={event} className="event-section">
                <Card className="total-card mb-3">
                  <Card.Header>{event} - Total</Card.Header>
                  <Card.Body>
                    <p><strong>Total Personal:</strong> {total}</p>
                  </Card.Body>
                </Card>
                {Object.entries(institutions).map(([institution, count]) => (
                  <Card
                    key={institution}
                    className="institution-card mb-3"
                    style={{ backgroundColor: getInstitutionColor(institution) }}
                  >
                    <Card.Header>{institution}</Card.Header>
                    <Card.Body>
                      <p>
                        {count} persona{count > 1 ? 's' : ''}
                      </p>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportePersonal;
