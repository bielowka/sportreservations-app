import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Button, Badge, Spinner, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Reservation, ReservationStatus } from '../types';

const ReservationsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/reservations', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();

        if (data.success && data.data) {
          setReservations(data.data);
        } else {
          setError(data.message || 'Nie udało się pobrać rezerwacji');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas pobierania rezerwacji');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchReservations();
    }
  }, [isAuthenticated]);

  const handleCancelReservation = async (reservationId: number) => {
    if (!window.confirm('Czy na pewno chcesz anulować tę rezerwację?')) {
      return;
    }

    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        const updatedReservations = reservations.map(res => 
          res.id === reservationId 
            ? { 
                ...res, 
                status: 'cancelled' as ReservationStatus, 
                cancelledAt: new Date().toISOString() 
              }
            : res
        );
        setReservations(updatedReservations);
        setError(null);
      } else {
        setError(data.error || 'Nie udało się anulować rezerwacji');
      }
    } catch (err) {
      setError('Wystąpił błąd podczas anulowania rezerwacji');
    }
  };

  const getStatusBadge = (status: ReservationStatus) => {
    switch (status) {
      case 'confirmed':
        return <Badge bg="success">Potwierdzona</Badge>;
      case 'pending':
        return <Badge bg="warning">Oczekująca</Badge>;
      case 'cancelled':
        return <Badge bg="danger">Anulowana</Badge>;
      case 'completed':
        return <Badge bg="info">Zakończona</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  if (!isAuthenticated) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          <Alert.Heading>Wymagane logowanie</Alert.Heading>
          <p>Musisz być zalogowany, aby zobaczyć swoje rezerwacje.</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button as={Link as any} to="/login" variant="primary">
              Przejdź do logowania
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Ładowanie...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">
        <i className="fas fa-calendar-check me-2"></i>
        Moje rezerwacje
      </h2>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          <Alert.Heading>Błąd</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      {reservations.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <i className="fas fa-calendar fa-4x text-muted mb-3"></i>
            <h4 className="text-muted">Brak rezerwacji</h4>
            <p className="text-muted mb-4">Nie masz jeszcze żadnych rezerwacji.</p>
            <Button as={Link as any} to="/objects" variant="primary">
              <i className="fas fa-search me-2"></i>
              Przeglądaj obiekty
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <ListGroup>
          {reservations.map((reservation) => (
            <ListGroup.Item 
              key={reservation.id} 
              className={`mb-3 ${reservation.status === 'cancelled' ? 'bg-light' : ''}`}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h5 className="mb-1">{reservation.object?.name}</h5>
                  <p className="mb-1 text-muted">
                    <i className="fas fa-clock me-2"></i>
                    {new Date(reservation.startTime).toLocaleString('pl-PL')} - {new Date(reservation.endTime).toLocaleString('pl-PL')}
                  </p>
                  {reservation.notes && (
                    <p className="mb-1 text-muted">
                      <i className="fas fa-comment me-2"></i>
                      {reservation.notes}
                    </p>
                  )}
                  <div className="d-flex align-items-center gap-2">
                    {getStatusBadge(reservation.status)}
                    {reservation.status === 'cancelled' && reservation.cancelledAt && (
                      <small className="text-muted">
                        <i className="fas fa-info-circle me-1"></i>
                        Anulowano: {new Date(reservation.cancelledAt).toLocaleString('pl-PL')}
                        {reservation.cancellationReason && (
                          <span className="ms-1">- {reservation.cancellationReason}</span>
                        )}
                      </small>
                    )}
                  </div>
                </div>
                {reservation.status !== 'cancelled' && (
                  <div>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleCancelReservation(reservation.id)}
                    >
                      <i className="fas fa-times me-1"></i>
                      Anuluj
                    </Button>
                  </div>
                )}
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Container>
  );
};

export default ReservationsPage; 