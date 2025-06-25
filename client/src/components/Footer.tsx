import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-5">
      <Container>
        <Row>
          <Col md={6}>
            <h5>
              <i className="fas fa-futbol me-2"></i>
              Sport Reservations
            </h5>
            <p className="mb-0">System rezerwacji obiektów sportowych</p>
          </Col>
          <Col md={6} className="text-md-end">
            <p className="mb-0">&copy; 2025 Sport Reservations.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer; 