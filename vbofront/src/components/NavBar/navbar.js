import React from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link } from 'react-router-dom';
import NavDropdown from 'react-bootstrap/NavDropdown';
import './navbar.css';

function NavBar({ handleSignOut }) {
  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container fluid>
        <img
          src={process.env.PUBLIC_URL + '/img/chlogotrans.png'} // Ruta de la imagen
          width="30"   // Ajusta el tamaño como sea necesario
          height="30"  // Ajusta el tamaño como sea necesario
          className="d-inline-block align-top" // Para alinear verticalmente con el texto
          alt="Logo"
        />
        <Navbar.Brand href="/inicio">Inicio</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav className="me-auto my-2 my-lg-0" style={{ maxHeight: '100px' }} navbarScroll>
            <Nav.Link as={Link} to="/situacion-actual">Situacion Actual</Nav.Link>
            <NavDropdown title="Emergencias" id="navbarScrollingDropdownEmergencias">
              <NavDropdown.Item href="/solicitudes">Solicitudes</NavDropdown.Item>
              <NavDropdown.Item href="/AtencionesEmergencias">Atenciones</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="/ListOperaciones">Operaciones</NavDropdown.Item>
              <NavDropdown title="SCI" id="navbarScrollingDropdownSCI">
                <NavDropdown.Item href="/comandante-incidente">
                  Formulario Comandante de Incidente <i className="bi bi-star-fill" style={{ color: 'blue' }} />
                </NavDropdown.Item>
                <NavDropdown.Item href="/oficial-enlaces">
                  Formulario Oficial de Enlaces <i className="bi bi-star-fill" style={{ color: 'blue' }} />
                </NavDropdown.Item>
                <NavDropdown.Item href="/oficial-informacion-publica">
                  Formulario Oficial de Información Pública <i className="bi bi-star-fill" style={{ color: 'blue' }} />
                </NavDropdown.Item>
                <NavDropdown.Item href="/oficial-seguridad">
                  Formulario Oficial de Seguridad <i className="bi bi-star-fill" style={{ color: 'blue' }} />
                </NavDropdown.Item>
              </NavDropdown>
            </NavDropdown>
            <NavDropdown title="Usuarios" id="navbarScrollingDropdownUsuarios">
              <NavDropdown.Item href="/RegistroUsuario">Registro Usuarios</NavDropdown.Item>
              <NavDropdown.Item href="/ListaUsuario">Usuarios</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action6">Reporte</NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title="Voluntarios" id="navbarScrollingDropdownVoluntarios">
              <NavDropdown.Item href="/Eventos">Registrar Eventos</NavDropdown.Item>
              <NavDropdown.Item href="/RegOp">Registrar Oportunidades</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="/ListEvent">Listar Eventos</NavDropdown.Item>
              <NavDropdown.Item href="/ListOport">Listar Oportunidades</NavDropdown.Item>
            </NavDropdown>
          </Nav>
          <Button variant="outline-danger" onClick={handleSignOut}>Cerrar Sesión</Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;