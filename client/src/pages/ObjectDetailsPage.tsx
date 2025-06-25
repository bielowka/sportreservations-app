import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Badge, 
  Button, 
  Spinner, 
  Alert,
  ListGroup,
  Table
} from 'react-bootstrap';
import { SportObject } from '../types';
import { objectsApi } from '../services/api';
import ScheduleDisplay from '../components/ScheduleDisplay';
import { useAuth } from '../contexts/AuthContext';

const ObjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [object, setObject] = useState<SportObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      fetchObjectDetails();
    }
  }, [id]);

  const fetchObjectDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await objectsApi.getObject(parseInt(id!));
      if (response.data) {
        setObject(response.data);

        if (user?.role === 'admin' && response.data.ownerId && response.data.ownerId !== user.id) {
          setError('Brak dostępu. Możesz przeglądać tylko swoje obiekty.');
          return;
        }
      } else {
        setError('Nie udało się pobrać szczegółów obiektu');
      }
    } catch (err) {
      console.error('Error fetching object details:', err);
      setError('Nie udało się pobrać szczegółów obiektu');
    } finally {
      setLoading(false);
    }
  };

  const getObjectTypeLabel = (type: string) => {
    const typeLabels: { [key: string]: string } = {
      football: 'Piłka nożna',
      tennis: 'Tenis',
      basketball: 'Koszykówka',
      volleyball: 'Siatkówka',
      swimming: 'Pływanie',
      gym: 'Siłownia',
      other: 'Inne'
    };
    return typeLabels[type] || type;
  };

  const getObjectTypeIcon = (type: string) => {
    const typeIcons: { [key: string]: string } = {
      football: 'fas fa-futbol',
      tennis: 'fas fa-table-tennis',
      basketball: 'fas fa-basketball-ball',
      volleyball: 'fas fa-volleyball-ball',
      swimming: 'fas fa-swimming-pool',
      gym: 'fas fa-dumbbell',
      other: 'fas fa-running'
    };
    return typeIcons[type] || 'fas fa-running';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCancelReservation = async (reservationId: number) => {
    if (!window.confirm('Czy na pewno chcesz anulować tę rezerwację?')) {
      return;
    }

    try {
      await objectsApi.cancelReservation(parseInt(id!), reservationId);
      fetchObjectDetails();
    } catch (err) {
      console.error('Error canceling reservation:', err);
      setError('Nie udało się anulować rezerwacji');
    }
  };

  if (loading) {
    return (
      <Container>
        <Row>
          <Col className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Ładowanie...</span>
            </Spinner>
            <p className="mt-3">Ładowanie szczegółów obiektu...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Row>
          <Col>
            <Alert variant="danger">
              <Alert.Heading>Błąd!</Alert.Heading>
              <p>{error}</p>
              {user?.role === 'admin' ? (
                <div className="d-flex gap-2">
                  <Button variant="outline-danger" onClick={fetchObjectDetails}>
                    Spróbuj ponownie
                  </Button>
                  <Button variant="outline-primary" onClick={() => navigate('/objects/my')}>
                    Powrót do moich obiektów
                  </Button>
                </div>
              ) : (
                <Button variant="outline-danger" onClick={fetchObjectDetails}>
                  Spróbuj ponownie
                </Button>
              )}
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!object) {
    return (
      <Container>
        <Row>
          <Col>
            <Alert variant="warning">
              <Alert.Heading>Obiekt nie znaleziony</Alert.Heading>
              <p>Nie udało się znaleźć obiektu o podanym ID.</p>
              <Link to="/objects">
                <Button variant="outline-warning">
                  Powrót do listy obiektów
                </Button>
              </Link>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container>
      <Row>
        <Col lg={8}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">
                  <i className={`${getObjectTypeIcon(object.objectType)} me-2`}></i>
                  {object.name}
                </h4>
                <Badge bg="light" text="dark">
                  <i className={`${getObjectTypeIcon(object.objectType)} me-1`}></i>
                  {getObjectTypeLabel(object.objectType)}
                </Badge>
              </div>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h6><i className="fas fa-map-marker-alt text-primary me-2"></i>Lokalizacja</h6>
                  <p className="mb-3">{object.location}</p>
                  
                  <h6><i className="fas fa-clock text-primary me-2"></i>Godziny otwarcia</h6>
                  <p className="mb-3">{object.openingTime} - {object.closingTime}</p>
                  
                  <h6><i className="fas fa-money-bill-wave text-primary me-2"></i>Cena</h6>
                  <p className="mb-3">
                    {object.pricePerHour > 0 ? `${object.pricePerHour} zł/h` : 'Darmowe'}
                  </p>
                </Col>
                <Col md={6}>
                  <h6><i className="fas fa-users text-primary me-2"></i>Pojemność</h6>
                  <p className="mb-3">Maksymalnie {object.maxCapacity} osób</p>
                  
                  <h6><i className="fas fa-calendar-alt text-primary me-2"></i>Status</h6>
                  <p className="mb-3">
                    <Badge bg={object.isActive ? 'success' : 'danger'}>
                      {object.isActive ? 'Aktywny' : 'Nieaktywny'}
                    </Badge>
                  </p>
                  
                  <h6><i className="fas fa-calendar-plus text-primary me-2"></i>Dodano</h6>
                  <p className="mb-3">{formatDate(object.createdAt)}</p>
                </Col>
              </Row>
              
              {object.description && (
                <>
                  <hr />
                  <h6><i className="fas fa-info-circle text-primary me-2"></i>Opis</h6>
                  <p className="mb-0">{object.description}</p>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Panel boczny */}
        <Col lg={4}>
          <Button as={Link as any} to={`/objects/${id}/reserve`} variant="primary" size="lg" className="w-100 py-3 mb-4">
            <i className="fas fa-calendar-plus me-2"></i>
            Zarezerwuj termin
          </Button>

          <Card className="shadow-sm">
            <Card.Header>
              <h6 className="mb-0">
                <i className="fas fa-phone text-success me-2"></i>
                Kontakt
              </h6>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <i className="fas fa-phone me-2 text-muted"></i>
                  +48 123 456 789
                </ListGroup.Item>
                <ListGroup.Item>
                  <i className="fas fa-envelope me-2 text-muted"></i>
                  kontakt@obiekt.pl
                </ListGroup.Item>
                <ListGroup.Item>
                  <i className="fas fa-globe me-2 text-muted"></i>
                  www.obiekt.pl
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {user?.role === 'admin' && (
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">
              <i className="bi bi-calendar-check me-2"></i>
              Rezerwacje
            </h5>
          </Card.Header>
          <Card.Body>
            {object.reservations && object.reservations.length > 0 ? (
              <ListGroup variant="flush">
                {object.reservations.map((reservation) => (
                  <ListGroup.Item key={reservation.id} className={`d-flex justify-content-between align-items-center ${reservation.status === 'cancelled' ? 'bg-light' : ''}`}>
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <strong>{new Date(reservation.startTime).toLocaleString('pl-PL')}</strong> - 
                        <strong>{new Date(reservation.endTime).toLocaleString('pl-PL')}</strong>
                        <Badge bg={reservation.status === 'confirmed' ? 'success' : reservation.status === 'cancelled' ? 'danger' : 'warning'}>
                          {reservation.status === 'confirmed' ? 'Potwierdzona' : reservation.status === 'cancelled' ? 'Anulowana' : 'Oczekująca'}
                        </Badge>
                      </div>
                      {reservation.user && (
                        <div className="text-muted">
                          <i className="fas fa-user me-1"></i>
                          Rezerwujący: {reservation.user.name}
                        </div>
                      )}
                      {reservation.notes && (
                        <div className="text-muted">
                          <i className="fas fa-comment me-1"></i>
                          Uwagi: {reservation.notes}
                        </div>
                      )}
                      {reservation.status === 'cancelled' && reservation.cancelledAt && (
                        <div className="text-muted">
                          <i className="fas fa-clock me-1"></i>
                          Anulowano: {new Date(reservation.cancelledAt).toLocaleString('pl-PL')}
                          {reservation.cancellationReason && (
                            <span className="ms-2">({reservation.cancellationReason})</span>
                          )}
                        </div>
                      )}
                    </div>
                    {reservation.status !== 'cancelled' && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleCancelReservation(reservation.id)}
                      >
                        <i className="fas fa-times me-1"></i>
                        Anuluj
                      </Button>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <p className="text-muted">Brak rezerwacji dla tego obiektu.</p>
            )}
          </Card.Body>
        </Card>
      )}

      <ScheduleDisplay objectId={object.id} />

      <div className="d-flex justify-content-center mt-4">
        <Button variant="outline-secondary" as={Link as any} to="/objects">
          <i className="fas fa-arrow-left me-2"></i>
          Powrót do listy
        </Button>
      </div>
    </Container>
  );
};

export default ObjectDetailsPage; 