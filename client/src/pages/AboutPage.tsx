import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const AboutPage: React.FC = () => {
  return (
    <Container>
      <Row>
        <Col>
          <div className="jumbotron bg-light p-5 rounded mb-4">
            <div className="ps-0">
              <h1 className="display-4 mb-3">O aplikacji</h1>
              <p className="lead">Poznaj szczegóły naszego systemu rezerwacji obiektów sportowych</p>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <p>
                Sport Reservations to nowoczesny system do zarządzania rezerwacjami obiektów sportowych. 
                Aplikacja została zbudowana przy użyciu React.js w frontendzie i Node.js z Express.js w backendzie.
              </p>
              <p>
                <strong>Funkcjonalności:</strong>
              </p>
              <ul>
                <li>Przeglądanie obiektów sportowych</li>
                <li>Rezerwowanie terminów</li>
                <li>Zarządzanie harmonogramami</li>
                <li>System autoryzacji użytkowników</li>
                <li>Responsywny design</li>
              </ul>

              <p>
                <strong>Technologie:</strong>
              </p>
              <ul>
                <li>Frontend: React.js, TypeScript, Bootstrap</li>
                <li>Backend: Node.js, Express.js</li>
                <li>Baza danych: MySQL</li>
                <li>Autentykacja: JWT</li>
              </ul>

              <p>
                <strong>Bezpieczeństwo:</strong>
              </p>
              <ul>
                <li>Szyfrowanie haseł</li>
                <li>Zabezpieczone endpointy API</li>
                <li>Walidacja danych</li>
                <li>Obsługa sesji użytkowników</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AboutPage; 