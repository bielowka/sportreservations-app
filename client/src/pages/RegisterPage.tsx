import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const RegisterPage: React.FC = () => {
  return (
    <Container>
      <Row>
        <Col>
          <Card>
            <Card.Body className="text-center py-5">
              <i className="fas fa-user-plus fa-4x text-muted mb-3"></i>
              <h4 className="text-muted">Rejestracja</h4>
              <p className="text-muted">Ta funkcjonalność będzie zaimplementowana wkrótce.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage; 