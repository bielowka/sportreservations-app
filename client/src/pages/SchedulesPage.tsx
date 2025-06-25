import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const SchedulesPage: React.FC = () => {
  return (
    <Container>
      <Row>
        <Col>
          <Card>
            <Card.Body className="text-center py-5">
              <i className="fas fa-clock fa-4x text-muted mb-3"></i>
              <h4 className="text-muted">Harmonogramy</h4>
              <p className="text-muted">Ta funkcjonalność będzie zaimplementowana wkrótce.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SchedulesPage; 