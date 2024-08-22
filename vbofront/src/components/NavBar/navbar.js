import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link } from 'react-router-dom';
import NavDropdown from 'react-bootstrap/NavDropdown';
import './navbar.css';

function NavBar({ handleSignOut }) {
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
  }, []);

  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container fluid>
        <img
          src={process.env.PUBLIC_URL + '/img/chlogotrans.png'}
          width="30"
          height="30"
          className="d-inline-block align-top"
          alt="Logo"
        />
        <Navbar.Brand href="/inicio">Inicio</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav className="me-auto my-2 my-lg-0" style={{ maxHeight: '100px' }} navbarScroll>
            {userRole === 'Administrador' && (
              <>
                <Nav.Link as={Link} to="/situacion-actual">Situacion Actual</Nav.Link>
            <NavDropdown title="Emergencias" id="navbarScrollingDropdownEmergencias">
              <NavDropdown.Item href="/solicitudes">Solicitudes</NavDropdown.Item>
              <NavDropdown.Item href="/AtencionesEmergencias">Atenciones</NavDropdown.Item>
              <NavDropdown.Item href="/listarreporteE">Reporte Emergencias</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="/ListOperaciones">Operaciones</NavDropdown.Item>
              <NavDropdown title="SCI" id="navbarScrollingDropdownSCI">
                
              <NavDropdown title="Formulario Comandante de Incidente" id="navbarScrollingDropdownComandante" >
               
              <NavDropdown.Item href="/forminci201">
                    1.- FORM 201
                  </NavDropdown.Item>
                  <NavDropdown.Item href="/forminci202">
                  2.- FORM 202
                  </NavDropdown.Item>
                  <NavDropdown.Item href="/forminci203">
                  3.- FORM 203
                  </NavDropdown.Item>

                  <NavDropdown.Item href="/forminci221">
                  12.- FORM 221 - Desmovilización
                  </NavDropdown.Item>
                </NavDropdown>
                
                <NavDropdown title="Formulario Oficial Seguridad" id="navbarScrollingDropdownComandante" >
               
               <NavDropdown.Item href="/forminci204">
                     4.- FORM 204
                   </NavDropdown.Item>
                 
                 </NavDropdown>


                 <NavDropdown title="Formulario Oficial Enlace" id="navbarScrollingDropdownComandante" >  
               <NavDropdown.Item href="/forminci205">
                     5.- FORM 205
                   </NavDropdown.Item>
                 </NavDropdown>

                 <NavDropdown title="Formulario Oficial Informacion Publica" id="navbarScrollingDropdownComandante" >  
               <NavDropdown.Item href="/forminci205b">
                     6.- FORM 205-B
                   </NavDropdown.Item>
                 </NavDropdown>

                 <NavDropdown title="Formulario Jefe de Operaciones" id="navbarScrollingDropdownComandante" >  
               <NavDropdown.Item href="/forminci206">
                     7.- FORM 206 - Plan Medico
                   </NavDropdown.Item>
                   <NavDropdown.Item href="/forminci207">
                     8.- FORM 207 - Registro de Victimas
                   </NavDropdown.Item>
                   <NavDropdown.Item href="/forminci211">
                     9.- FORM 211 - Registro Personal
                   </NavDropdown.Item>
                 </NavDropdown>
              
                 <NavDropdown title="Formulario Jefe de Logistica" id="navbarScrollingDropdownComandante" >  
               <NavDropdown.Item href="/forminci215">
                     10.- FORM 215 - Registro Logistica
                   </NavDropdown.Item>
                   
                 </NavDropdown>

                 <NavDropdown title="Formulario Jefe de Planificacion" id="navbarScrollingDropdownComandante" >  
               <NavDropdown.Item href="/forminci214">
                     11.- FORM 214 - Registro Actividades
                   </NavDropdown.Item>
                   
                 </NavDropdown>


              </NavDropdown>
            </NavDropdown>

            <NavDropdown.Divider />
            
              <NavDropdown title="Reportes SCI" id="navbarScrollingDropdownSCI">
                
              <NavDropdown title="Comandante de Incidente" id="navbarScrollingDropdownComandante" >
               
              <NavDropdown.Item href="/formpreview">
                    1.- FORM 201
                  </NavDropdown.Item>
                  <NavDropdown.Item href="/formpreview2">
                  2.- FORM 202
                  </NavDropdown.Item>
                  <NavDropdown.Item href="/formpreview3">
                  3.- FORM 203
                  </NavDropdown.Item>

                  <NavDropdown.Item href="/formpreview221">
                  12.- FORM 221 - Desmovilización
                  </NavDropdown.Item>
                </NavDropdown>
               
                <NavDropdown title=" Oficial de Seguridad" id="navbarScrollingDropdownComandante" >  
               <NavDropdown.Item href="/formpreview204">
                     4.- FORM 204
                   </NavDropdown.Item>
                 </NavDropdown>
               
                <NavDropdown title=" Oficial de Enlace" id="navbarScrollingDropdownComandante" >  
               <NavDropdown.Item href="/formpreview205">
                     5.- FORM 205
                   </NavDropdown.Item>
                 </NavDropdown>

                 <NavDropdown title=" Oficial de Informacion Publica" id="navbarScrollingDropdownComandante" >  
               <NavDropdown.Item href="/formpreview205b">
                     6.- FORM 205B
                   </NavDropdown.Item>
                 </NavDropdown>

                 <NavDropdown title="Jefe de Operaciones" id="navbarScrollingDropdownComandante" >  
               <NavDropdown.Item href="/formpreview206">
                     7.- FORM 206 - Plan Medico
                   </NavDropdown.Item>
                   <NavDropdown.Item href="/formpreview207">
                     8.- FORM 207 - Registro de Victimas
                   </NavDropdown.Item>
                   <NavDropdown.Item href="/formpreview211">
                     9.- FORM 211 - Registro Personal
                   </NavDropdown.Item>
                   <NavDropdown.Item href="/reportepersonal">
                     10.- Reporte Personal
                   </NavDropdown.Item>
                 </NavDropdown>

                 <NavDropdown title="Jefe de Logistica" id="navbarScrollingDropdownComandante" >  
               <NavDropdown.Item href="/formpreview215">
                     10.- FORM 215 - Registro Logistica
                   </NavDropdown.Item>
                   
                 </NavDropdown>

                 <NavDropdown title="Jefe de Planificacion" id="navbarScrollingDropdownComandante" >  
               <NavDropdown.Item href="/formpreview214">
                     11.- FORM 214 - Registro Actividades
                   </NavDropdown.Item>
                   
                 </NavDropdown>
                 <NavDropdown.Item href="/reportegral">Reporte General</NavDropdown.Item>
                 <NavDropdown.Item href="/reportegralpersonal">Reporte General Personal</NavDropdown.Item>
                </NavDropdown>
              


            <NavDropdown title="Usuarios" id="navbarScrollingDropdownUsuarios">
              <NavDropdown.Item href="/RegistroUsuario">Registro Usuarios</NavDropdown.Item>
              <NavDropdown.Item href="/ListaUsuario">Usuarios</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action">Reporte</NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title="Voluntarios" id="navbarScrollingDropdownVoluntarios">
              <NavDropdown.Item href="/Eventos">Registrar Eventos</NavDropdown.Item>
              <NavDropdown.Item href="/RegOp">Registrar Oportunidades</NavDropdown.Item>
              <NavDropdown.Item href="/registrarU">Registrar Unidad</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="/ListEvent">Listar Eventos</NavDropdown.Item>
              <NavDropdown.Item href="/ListOport">Listar Oportunidades</NavDropdown.Item>
              <NavDropdown.Item href="/listarUn">Listar Unidades</NavDropdown.Item>
            </NavDropdown>
              </>
            )}
            {userRole === 'Administrador_epr' && (
              <>
                <NavDropdown title="Administrador Voluntarios" id="navbarScrollingDropdownVoluntarios">
                  <NavDropdown.Item href="/Eventos">Registrar Eventos</NavDropdown.Item>
                  <NavDropdown.Item href="/RegOp">Registrar Oportunidades</NavDropdown.Item>
                  <NavDropdown.Item href="/registrarU">Registrar Unidad</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href="/ListEvent">Listar Eventos</NavDropdown.Item>
                  <NavDropdown.Item href="/ListOport">Listar Oportunidades</NavDropdown.Item>
                  <NavDropdown.Item href="/listarUn">Listar Unidades</NavDropdown.Item>
                </NavDropdown>
              </>
            )}
          </Nav>
          <Button variant="outline-danger" onClick={handleSignOut}>Cerrar Sesión</Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
