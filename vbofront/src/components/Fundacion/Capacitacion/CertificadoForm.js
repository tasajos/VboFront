import React, { useState } from 'react';
import { Document, Page, Text, Image, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import * as XLSX from 'xlsx';
import { auth } from '../../../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../NavBar/navbar';
import './CertificadoForm.css';

function CertificadoForm() {
  const [titulo, setTitulo] = useState('');
  const [codigo, setCodigo] = useState('');
  const [participante, setParticipante] = useState('');
  const [curso, setCurso] = useState('');
  const [modalidad, setModalidad] = useState('');
  const [horasAcademicas, setHorasAcademicas] = useState('');
  const [instructorPrincipal, setInstructorPrincipal] = useState('');
  const [cuerpoCertificado, setCuerpoCertificado] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [generatedCertificate, setGeneratedCertificate] = useState(null);
  const [bulkCertificates, setBulkCertificates] = useState([]);
  const [logoLeft, setLogoLeft] = useState(null);
  const [logoRight, setLogoRight] = useState(null);
  const [logoCenter, setLogoCenter] = useState(null);
  const [signature, setSignature] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (event, setImageFunc) => {
    const file = event.target.files[0];
    setImageFunc(URL.createObjectURL(file));
  };

  const handleGenerateCertificate = () => {
    const certificate = {
      titulo,
      codigo,
      participante,
      curso,
      modalidad,
      horasAcademicas,
      instructorPrincipal,
      cuerpoCertificado,
    };
    setGeneratedCertificate(certificate);
    setShowModal(true);
  };

  const handleBulkUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(firstSheet);

      const certificates = rows.map(row => ({
        titulo: row.Titulo,
        codigo: row.Codigo,
        participante: row.Participante,
        curso: row.Curso,
        modalidad: row.Modalidad,
        horasAcademicas: row['Horas Academicas'],
        instructorPrincipal: row['Instructor Principal'],
        cuerpoCertificado: row['Cuerpo Certificado']
      }));

      setBulkCertificates(certificates);
      setShowModal(true);
    };

    reader.readAsArrayBuffer(file);
  };

  const generateTemplate = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([
      {
        Titulo: '',
        Codigo: '',
        Participante: '',
        Curso: '',
        Modalidad: '',
        'Horas Academicas': '',
        'Instructor Principal': '',
        'Cuerpo Certificado': ''
      }
    ]);

    XLSX.utils.book_append_sheet(wb, ws, 'Certificado_Template');
    XLSX.writeFile(wb, 'Certificado_Template.xlsx');
  };

  const CertificateDocument = ({ certificate }) => (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.logoContainer}>
          {logoLeft && <Image style={styles.logo} src={logoLeft} />}
          {logoCenter && <Image style={styles.logo} src={logoCenter} />}
          {logoRight && <Image style={styles.logo} src={logoRight} />}
        </View>
        <Text style={styles.title}>{certificate.titulo}</Text>
        <Text style={styles.subtitle}>Otorga el siguiente certificado al Sr:</Text>
        <Text style={styles.participantName}>{certificate.participante}</Text>
        <Text style={styles.subtitle}>Por aprobar el curso de:</Text>
        <Text style={[styles.title, { fontWeight: 'bold' }]}>{certificate.curso}</Text>
        <Text style={styles.text}>Modalidad: {certificate.modalidad}</Text>
        <Text style={styles.certificateBody}>{certificate.cuerpoCertificado}</Text>
        <Text style={styles.text}>Con una carga horaria de {certificate.horasAcademicas} horas académicas</Text>
        <View style={styles.signature}>
          {signature && <Image style={styles.signatureImage} src={signature} />}
          <Text>{certificate.instructorPrincipal}</Text>
          <Text>Instructor</Text>
        </View>
        <Text style={styles.footer}>Cochabamba, {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}</Text>
        <Text style={styles.code}>{certificate.codigo}</Text>
      </Page>
    </Document>
  );

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/signin');
      console.log('Sesión cerrada');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

  const styles = StyleSheet.create({
    page: {
      padding: 30,
      fontSize: 12,
      backgroundColor: '#ffffff',
      flexDirection: 'column',
    },
    logoContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    logo: {
      width: 50,
      height: 50,
    },
    title: {
      fontSize: 18,
      textAlign: 'center',
      margin: 20,
    },
    code: {
      fontSize: 12,
      textAlign: 'right',
      position: 'absolute',
      bottom: 30,
      right: 30,
    },
    subtitle: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 10,
    },
    participantName: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 10,
      textTransform: 'uppercase',
    },
    text: {
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 5,
    },
    certificateBody: {
      marginTop: 30,
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 30,
    },
    signature: {
      fontSize: 14,
      textAlign: 'center',
      marginTop: 30,
    },
    footer: {
      fontSize: 12,
      textAlign: 'center',
      marginTop: 50,
    },
  });

  return (
    <div>
      <NavBar handleSignOut={handleSignOut} />
      <br />
      <div className="certificado-form-container">
        <h2 className="text-center">Generar Certificado de Participación</h2>

        <Button variant="warning" className="mb-4" onClick={generateTemplate}>
          Descargar Template
        </Button>
        <Button variant="primary" className="mb-4 ml-3" onClick={() => document.getElementById('bulkUpload').click()}>
          Carga Masiva
        </Button>
        <input
          type="file"
          id="bulkUpload"
          style={{ display: 'none' }}
          accept=".xlsx, .xls"
          onChange={handleBulkUpload}
        />

        <Form>
          <Form.Group controlId="titulo">
            <Form.Label>Título del Certificado:</Form.Label>
            <Form.Control
              type="text"
              placeholder="Título del certificado"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="codigo">
            <Form.Label>Código del Certificado:</Form.Label>
            <Form.Control
              type="text"
              placeholder="Código del certificado"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="participante">
            <Form.Label>Participante:</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nombre del participante"
              value={participante}
              onChange={(e) => setParticipante(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="curso">
            <Form.Label>Curso:</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nombre del curso"
              value={curso}
              onChange={(e) => setCurso(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="modalidad">
            <Form.Label>Modalidad:</Form.Label>
            <Form.Control
              type="text"
              placeholder="Modalidad del curso"
              value={modalidad}
              onChange={(e) => setModalidad(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="horasAcademicas">
            <Form.Label>Horas Académicas:</Form.Label>
            <Form.Control
              type="number"
              placeholder="Número de horas académicas"
              value={horasAcademicas}
              onChange={(e) => setHorasAcademicas(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="cuerpoCertificado">
            <Form.Label>Cuerpo del Certificado:</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Texto que se mostrará en el cuerpo del certificado"
              value={cuerpoCertificado}
              onChange={(e) => setCuerpoCertificado(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="instructorPrincipal">
            <Form.Label>Instructor Principal:</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nombre del instructor principal"
              value={instructorPrincipal}
              onChange={(e) => setInstructorPrincipal(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="logoLeft">
            <Form.Label>Logo Izquierdo:</Form.Label>
            <Form.Control
              type="file"
              onChange={(e) => handleFileChange(e, setLogoLeft)}
            />
          </Form.Group>

          <Form.Group controlId="logoCenter">
            <Form.Label>Logo Central:</Form.Label>
            <Form.Control
              type="file"
              onChange={(e) => handleFileChange(e, setLogoCenter)}
            />
          </Form.Group>

          <Form.Group controlId="logoRight">
            <Form.Label>Logo Derecho:</Form.Label>
            <Form.Control
              type="file"
              onChange={(e) => handleFileChange(e, setLogoRight)}
            />
          </Form.Group>

          <Form.Group controlId="signature">
            <Form.Label>Firma del Instructor:</Form.Label>
            <Form.Control
              type="file"
              onChange={(e) => handleFileChange(e, setSignature)}
            />
          </Form.Group>

          <Button variant="primary" className="mt-3" onClick={handleGenerateCertificate}>
            Generar Certificado
          </Button>
        </Form>

        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Certificado Generado</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Haz clic en el siguiente enlace para descargar el certificado:</p>
            {bulkCertificates.length > 0 ? (
              bulkCertificates.map((certificate, index) => (
                <div key={index}>
                  <PDFDownloadLink
                    document={<CertificateDocument certificate={certificate} />}
                    fileName={`certificado_${certificate.participante}.pdf`}
                  >
                    <Button variant="success" className="mb-2">
                      Descargar Certificado de {certificate.participante}
                    </Button>
                  </PDFDownloadLink>
                </div>
              ))
            ) : (
              generatedCertificate && (
                <PDFDownloadLink
                  document={<CertificateDocument certificate={generatedCertificate} />}
                  fileName="certificado.pdf"
                >
                  <Button variant="success">Descargar Certificado</Button>
                </PDFDownloadLink>
              )
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default CertificadoForm;