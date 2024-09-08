import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link } from 'react-router-dom';
import NavDropdown from 'react-bootstrap/NavDropdown';
import './navbar.css';

function NavBar({ handleSignOut }) {
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userUnit, setUserUnit] = useState('');

  useEffect(() => {
    const name = localStorage.getItem('userName');
    const role = localStorage.getItem('userRole');
    const unidad = localStorage.getItem('userUnit');

    setUserName(name);
    setUserRole(role);
    setUserUnit(unidad);
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
                    <NavDropdown title="Formulario Comandante de Incidente" id="navbarScrollingDropdownComandante">
                      <NavDropdown.Item href="/forminci201">1.- FORM 201</NavDropdown.Item>
                      <NavDropdown.Item href="/forminci202">2.- FORM 202</NavDropdown.Item>
                      <NavDropdown.Item href="/forminci203">3.- FORM 203</NavDropdown.Item>
                      <NavDropdown.Item href="/forminci221">12.- FORM 221 - Desmovilización</NavDropdown.Item>
                    </NavDropdown>
                    <NavDropdown title="Formulario Oficial Seguridad" id="navbarScrollingDropdownComandante">
                      <NavDropdown.Item href="/forminci204">4.- FORM 204</NavDropdown.Item>
                    </NavDropdown>
                    <NavDropdown title="Formulario Oficial Enlace" id="navbarScrollingDropdownComandante">
                      <NavDropdown.Item href="/forminci205">5.- FORM 205</NavDropdown.Item>
                    </NavDropdown>
                    <NavDropdown title="Formulario Oficial Informacion Publica" id="navbarScrollingDropdownComandante">
                      <NavDropdown.Item href="/forminci205b">6.- FORM 205-B</NavDropdown.Item>
                    </NavDropdown>
                    <NavDropdown title="Formulario Jefe de Operaciones" id="navbarScrollingDropdownComandante">
                      <NavDropdown.Item href="/forminci206">7.- FORM 206 - Plan Medico</NavDropdown.Item>
                      <NavDropdown.Item href="/forminci207">8.- FORM 207 - Registro de Victimas</NavDropdown.Item>
                      <NavDropdown.Item href="/forminci211">9.- FORM 211 - Registro Personal</NavDropdown.Item>
                    </NavDropdown>
                    <NavDropdown title="Formulario Jefe de Logistica" id="navbarScrollingDropdownComandante">
                      <NavDropdown.Item href="/forminci215">10.- FORM 215 - Registro Logistica</NavDropdown.Item>
                    </NavDropdown>
                    <NavDropdown title="Formulario Jefe de Planificacion" id="navbarScrollingDropdownComandante">
                      <NavDropdown.Item href="/forminci214">11.- FORM 214 - Registro Actividades</NavDropdown.Item>
                    </NavDropdown>
                  </NavDropdown>
                </NavDropdown>

                <NavDropdown.Divider />

                <NavDropdown title="Reportes SCI" id="navbarScrollingDropdownSCI">
                  <NavDropdown title="Comandante de Incidente" id="navbarScrollingDropdownComandante">
                    <NavDropdown.Item href="/formpreview">1.- FORM 201</NavDropdown.Item>
                    <NavDropdown.Item href="/formpreview2">2.- FORM 202</NavDropdown.Item>
                    <NavDropdown.Item href="/formpreview3">3.- FORM 203</NavDropdown.Item>
                    <NavDropdown.Item href="/formpreview221">12.- FORM 221 - Desmovilización</NavDropdown.Item>
                  </NavDropdown>
                  <NavDropdown title="Oficial de Seguridad" id="navbarScrollingDropdownComandante">
                    <NavDropdown.Item href="/formpreview204">4.- FORM 204</NavDropdown.Item>
                  </NavDropdown>
                  <NavDropdown title="Oficial de Enlace" id="navbarScrollingDropdownComandante">
                    <NavDropdown.Item href="/formpreview205">5.- FORM 205</NavDropdown.Item>
                  </NavDropdown>
                  <NavDropdown title="Oficial de Informacion Publica" id="navbarScrollingDropdownComandante">
                    <NavDropdown.Item href="/formpreview205b">6.- FORM 205B</NavDropdown.Item>
                  </NavDropdown>
                  <NavDropdown title="Jefe de Operaciones" id="navbarScrollingDropdownComandante">
                    <NavDropdown.Item href="/formpreview206">7.- FORM 206 - Plan Medico</NavDropdown.Item>
                    <NavDropdown.Item href="/formpreview207">8.- FORM 207 - Registro de Victimas</NavDropdown.Item>
                    <NavDropdown.Item href="/formpreview211">9.- FORM 211 - Registro Personal</NavDropdown.Item>
                    <NavDropdown.Item href="/reportepersonal">10.- Reporte Personal</NavDropdown.Item>
                  </NavDropdown>
                  <NavDropdown title="Jefe de Logistica" id="navbarScrollingDropdownComandante">
                    <NavDropdown.Item href="/formpreview215">10.- FORM 215 - Registro Logistica</NavDropdown.Item>
                  </NavDropdown>
                  <NavDropdown title="Jefe de Planificacion" id="navbarScrollingDropdownComandante">
                    <NavDropdown.Item href="/formpreview214">11.- FORM 214 - Registro Actividades</NavDropdown.Item>
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

             {/* Menú Fundación */}
             <NavDropdown title="Fundación" id="navbarScrollingDropdownFundacion">

            {/* Menú Personal */}

            <NavDropdown title="Personal" id="navbarScrollingDropdownPersonal">
            <NavDropdown.Item href="regpersoF">Registro de Personal</NavDropdown.Item>
            <NavDropdown.Item href="listpersoF">Lista de Personal</NavDropdown.Item>
            <NavDropdown.Item href="rgasis">Registro Asistencia</NavDropdown.Item>
            <NavDropdown.Item href="repper">Reportes de Personal</NavDropdown.Item>
            <NavDropdown.Item href="segpersonal">Seguimiento de Personal</NavDropdown.Item>
            <NavDropdown.Item href="/personal/actividades">Actividades del Personal</NavDropdown.Item>
            </NavDropdown>

            {/* Menú Logística */}

            <NavDropdown title="Logística" id="navbarScrollingDropdownLogistica">
            <NavDropdown.Item href="/logistica/inventario">Inventario</NavDropdown.Item>
            <NavDropdown.Item href="/logistica/proveedores">Proveedores</NavDropdown.Item>
            <NavDropdown.Item href="/logistica/transporte">Transporte y Almacenamiento</NavDropdown.Item>
            <NavDropdown.Item href="/logistica/mantenimiento">Mantenimiento Logístico</NavDropdown.Item>
          </NavDropdown>

            {/* Menú Finanzas */}

            <NavDropdown title="Finanzas" id="navbarScrollingDropdownFinanzas">
              <NavDropdown.Item href="/finanzas/pagos">Pagos y Cobros</NavDropdown.Item>
              <NavDropdown.Item href="/finanzas/reportes">Reportes Financieros</NavDropdown.Item>
              <NavDropdown.Item href="/finanzas/presupuesto">Presupuesto</NavDropdown.Item>
              <NavDropdown.Item href="/finanzas/inversiones">Inversiones</NavDropdown.Item>
            </NavDropdown>

            {/* Menú Operaciones */}

            <NavDropdown title="Operaciones" id="navbarScrollingDropdownOperaciones">
              <NavDropdown.Item href="rgope">Registro de Operaciones</NavDropdown.Item>
              <NavDropdown.Item href="/operaciones/reportes">Reportes de Operaciones</NavDropdown.Item>
              <NavDropdown.Item href="/operaciones/planificacion">Planificación de Operaciones</NavDropdown.Item>
              <NavDropdown.Item href="/operaciones/ejecucion">Ejecución de Operaciones</NavDropdown.Item>
            </NavDropdown>

            {/* Menú Capacitación */}

            <NavDropdown title="Capacitación" id="navbarScrollingDropdownCapacitacion">
              <NavDropdown.Item href="/capacitacion/cursos">Cursos</NavDropdown.Item>
              <NavDropdown.Item href="certgene">Generar Certificados</NavDropdown.Item>
              <NavDropdown.Item href="/capacitacion/reportes">Reportes de Capacitación</NavDropdown.Item>
              <NavDropdown.Item href="/capacitacion/planes">Planes de Capacitación</NavDropdown.Item>
              <NavDropdown.Item href="/capacitacion/evaluacion">Evaluación de Capacitación</NavDropdown.Item>
            </NavDropdown>
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
                {/* Menú Fundación */}
                  <NavDropdown title="Fundación" id="navbarScrollingDropdownFundacion">

                  {/* Menú Personal */}

                  <NavDropdown title="Personal" id="navbarScrollingDropdownPersonal">
                    <NavDropdown.Item href="regpersoF">Registro de Personal</NavDropdown.Item>
                    <NavDropdown.Item href="listpersoF">Lista de Personal</NavDropdown.Item>
                    <NavDropdown.Item href="rgasis">Registro Asistencia</NavDropdown.Item>
                    <NavDropdown.Item href="repper">Reportes de Personal</NavDropdown.Item>
                    <NavDropdown.Item href="segpersonal">Seguimiento de Personal</NavDropdown.Item>
                    <NavDropdown.Item href="accper">Actividades del Personal</NavDropdown.Item>
                  </NavDropdown>

                  {/* Menú Logística */}

                  <NavDropdown title="Logística" id="navbarScrollingDropdownLogistica">
                    {/*<NavDropdown.Item href="clcodig">Clasificacion de Codigo</NavDropdown.Item>*/}
                    <NavDropdown.Item href="clcodig">Registrar Equipo</NavDropdown.Item>
                    <NavDropdown.Item href="Listq">Lista de Equipos</NavDropdown.Item>
                    <NavDropdown.Item href="AsigEq">Asignar Equipo</NavDropdown.Item>
                    <NavDropdown.Item href="Histasig">Historial Asignaciones</NavDropdown.Item>
                  </NavDropdown>

                  {/* Menú Finanzas */}

                  <NavDropdown title="Finanzas" id="navbarScrollingDropdownFinanzas">
                    <NavDropdown.Item href="ingfinanz">Registrar Ingresos</NavDropdown.Item>
                    <NavDropdown.Item href="egrfinanz">Registrar Egresos</NavDropdown.Item>
                    <NavDropdown.Item href="/finanzas/presupuesto">Presupuesto</NavDropdown.Item>
                    <NavDropdown.Item href="/finanzas/inversiones">Inversiones</NavDropdown.Item>
                  </NavDropdown>

                  {/* Menú Operaciones */}

                  <NavDropdown title="Operaciones" id="navbarScrollingDropdownOperaciones">
                    <NavDropdown.Item href="rgope">Registro de Operaciones</NavDropdown.Item>
                    <NavDropdown.Item href="infopdi">Informe Operaciones Diario</NavDropdown.Item>
                    <NavDropdown.Item href="infomissi">informe Mision</NavDropdown.Item>
                    <NavDropdown.Item href="libroNove">Registro Libro de Novedades</NavDropdown.Item>
                    <NavDropdown.Item href="libroNov">Informe Libro de Novedades</NavDropdown.Item>
                    <NavDropdown.Item href="repote">Reporte por Tipo</NavDropdown.Item>                  
                  </NavDropdown>

                  {/* Menú Capacitación */}

                  <NavDropdown title="Capacitación" id="navbarScrollingDropdownCapacitacion">
                    <NavDropdown.Item href="/capacitacion/cursos">Cursos</NavDropdown.Item>
                    <NavDropdown.Item href="certgene">Generar Certificados</NavDropdown.Item>
                    <NavDropdown.Item href="/capacitacion/reportes">Reportes de Capacitación</NavDropdown.Item>
                    <NavDropdown.Item href="/capacitacion/planes">Planes de Capacitación</NavDropdown.Item>
                    <NavDropdown.Item href="/capacitacion/evaluacion">Evaluación de Capacitación</NavDropdown.Item>
                  </NavDropdown>
                </NavDropdown>
              </>
            )}

            {userRole === 'Voluntario' && (
              <>
               {/* Menú Operaciones */}

               <NavDropdown title="Voluntarios" id="navbarScrollingDropdownVoluntarios">
                    <NavDropdown.Item href="rgope">Operaciones</NavDropdown.Item>
                    <NavDropdown.Item href="pervol">Perfil</NavDropdown.Item>
                    <NavDropdown.Item href="/operaciones/planificacion">Planificación de Operaciones</NavDropdown.Item>
                    <NavDropdown.Item href="/operaciones/ejecucion">Ejecución de Operaciones</NavDropdown.Item>
                  </NavDropdown>
              </>
            )}

          </Nav>
          <Nav>
            {userName && <Nav.Link disabled>Bienvenido, {userName} ({userRole}) ({userUnit})</Nav.Link>}
            <Button variant="outline-danger" onClick={handleSignOut}>Cerrar Sesión</Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;