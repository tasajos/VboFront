// NavBar.js
import React from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
//import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link } from 'react-router-dom';
import NavDropdown from 'react-bootstrap/NavDropdown';

function NavBar({ handleSignOut }) {  // Aceptar handleSignOut como prop
  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container fluid>
      {' '}
      <img
            src={process.env.PUBLIC_URL + '/img/chlogotrans.png'} // Ruta de la imagen
            width="30"   // Ajusta el tamaño como sea necesario
            height="30"  // Ajusta el tamaño como sea necesario
            className="d-inline-block align-top" // Para alinear verticalmente con el texto
            alt="Logo"
          />
          {' '}
            
        <Navbar.Brand href="/inicio">Inicio</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav className="me-auto my-2 my-lg-0" style={{ maxHeight: '100px' }} navbarScroll>
          <Nav.Link as={Link} to="/situacion-actual">Situacion Actual</Nav.Link>
          <NavDropdown title="Emergencias" id="navbarScrollingDropdown">
              <NavDropdown.Item href="/solicitudes">Solicitudes</NavDropdown.Item>
              <NavDropdown.Item href="/AtencionesEmergencias">Atenciones</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action5">Reporte</NavDropdown.Item>
            </NavDropdown>
            <Nav.Link href="#action2">Voluntarios</Nav.Link>
            
            {/* <Nav.Link href="#" disabled>Link</Nav.Link>*/}
          </Nav>
          <Button variant="outline-danger" onClick={handleSignOut}>Cerrar Sesión</Button>  {/* Uso de handleSignOut */}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
