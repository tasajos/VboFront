// NavBar.js
import React from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

function NavBar({ handleSignOut }) {  // Aceptar handleSignOut como prop
  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container fluid>
        <Navbar.Brand href="#">Inicio</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav className="me-auto my-2 my-lg-0" style={{ maxHeight: '100px' }} navbarScroll>
            <Nav.Link href="#action1">Situacion Actual</Nav.Link>
            <Nav.Link href="#action2">Voluntarios</Nav.Link>
            <NavDropdown title="Emergencias" id="navbarScrollingDropdown">
              <NavDropdown.Item href="#action3">Solicitudes</NavDropdown.Item>
              <NavDropdown.Item href="#action4">Atenciones</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action5">Reporte</NavDropdown.Item>
            </NavDropdown>
            {/* <Nav.Link href="#" disabled>Link</Nav.Link>*/}
          </Nav>
          <Button variant="outline-danger" onClick={handleSignOut}>Cerrar Sesión</Button>  {/* Uso de handleSignOut */}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
