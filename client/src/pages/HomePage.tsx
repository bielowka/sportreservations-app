import React from 'react';
import { Container, Row, Col, Card, Carousel, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <Container>
      <Row>
        <Col>
          <div className="jumbotron bg-light p-5 rounded mb-4">
            <div className="ps-0">
              <h1 className="display-4 mb-3">Witaj w systemie rezerwacji obiektów sportowych!</h1>
              {/* <p className="lead">Witaj w systemie rezerwacji obiektów sportowych!</p> */}
              <hr className="my-4" />
              
              <div className="carousel-container mb-4" style={{ maxHeight: '400px', overflow: 'hidden' }}>
                <Carousel>
                  <Carousel.Item>
                    <img
                      className="d-block w-100"
                      src="/images/carousel/slide1.jpg"
                      alt="Boisko sportowe"
                      style={{ objectFit: 'cover', height: '400px' }}
                    />
                  </Carousel.Item>
                  <Carousel.Item>
                    <img
                      className="d-block w-100"
                      src="/images/carousel/slide2.jpg"
                      alt="Kort tenisowy"
                      style={{ objectFit: 'cover', height: '400px' }}
                    />
                  </Carousel.Item>
                  <Carousel.Item>
                    <img
                      className="d-block w-100"
                      src="/images/carousel/slide3.jpg"
                      alt="Hala sportowa"
                      style={{ objectFit: 'cover', height: '400px' }}
                    />
                  </Carousel.Item>
                </Carousel>
              </div>

              <Row>
                <Col md={4} className="mb-3">
                  <Card className="h-100 text-center">
                    <Card.Body>
                      <i className="fas fa-search fa-3x text-primary mb-3"></i>
                      <Card.Title>Przeglądaj obiekty</Card.Title>
                      <Card.Text>
                        Znajdź obiekty sportowe w swojej okolicy i sprawdź ich dostępność.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4} className="mb-3">
                  <Card className="h-100 text-center">
                    <Card.Body>
                      <i className="fas fa-clock fa-3x text-info mb-3"></i>
                      <Card.Title>Sprawdź harmonogramy</Card.Title>
                      <Card.Text>
                        Sprawdź harmonogramy obiektów i dostępne terminy rezerwacji.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4} className="mb-3">
                  <Card className="h-100 text-center">
                    <Card.Body>
                      <i className="fas fa-calendar-plus fa-3x text-success mb-3"></i>
                      <Card.Title>Rezerwuj terminy</Card.Title>
                      <Card.Text>
                        Zarezerwuj obiekt sportowy na wybrany termin w prosty i szybki sposób.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <div className="text-center mt-2">
                <Link to="/objects" className="w-100 d-block">
                  <Button variant="primary" size="lg" className="w-100">
                    <i className="fas fa-calendar-check me-2"></i>
                    Rezerwuj teraz
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <p>Załóż konto klienta, aby wygodnie rezerwować obiekty sportowe takie jak boiska, korty tenisowe i inne. Załóż konto właściciela, aby zarządzać rezerwacjami w swoich obiektach sportowych.</p>
        <Link to="/about" className="text-decoration-none">
          Dowiedz się więcej o aplikacji
        </Link>
      </Row>
    </Container>
  );
};

export default HomePage; 