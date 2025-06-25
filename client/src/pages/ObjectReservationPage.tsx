import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Card, Button, Alert, Spinner } from 'react-bootstrap';
import ReservationCalendar from '../components/ReservationCalendar';
import TimeSlotTable from '../components/TimeSlotTable';
import ReservationSidebar from '../components/ReservationSidebar';
import { useAuth } from '../contexts/AuthContext';

interface SportObject {
  id: number;
  name: string;
  timeSlotDuration: number;
  minReservationDuration: number;
  // inne pola...
}

const ObjectReservationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const objectId = Number(id);
  const { user, isAuthenticated } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [object, setObject] = useState<SportObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchObject = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/objects/${objectId}`);
        if (!response.ok) {
          throw new Error('Nie udało się pobrać danych obiektu');
        }
        const data = await response.json();
        setObject(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Wystąpił błąd');
      } finally {
        setLoading(false);
      }
    };

    fetchObject();
  }, [objectId]);

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

  if (!isAuthenticated) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          <Alert.Heading>Wymagane logowanie</Alert.Heading>
          <p>Musisz być zalogowany, aby dokonać rezerwacji.</p>
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

  if (error || !object) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Błąd</Alert.Heading>
          <p>{error || 'Nie udało się załadować danych obiektu'}</p>
        </Alert>
      </Container>
    );
  }

  const handleTimeSlotSelect = (slot: any) => {
    setSelectedSlot(slot);
  };

  const handleConfirmReservation = async () => {
    if (!selectedDate || !selectedSlot || !object || !isAuthenticated) {
      return;
    }

    try {
      const dateString = selectedDate.toISOString().split('T')[0];
      
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          objectId: object.id,
          date: dateString,
          time: selectedSlot.time,
          duration: object.timeSlotDuration,
          notes: ''
        })
      });

      const result = await response.json();

      if (!result.success) {
        alert(`Błąd: ${result.error}`);
        return;
      }

      // Sukces - pokaż komunikat i ukryj sidebar
      alert('Rezerwacja została utworzona pomyślnie!');
      setSelectedSlot(null);
      
      // Odśwież dane w tabeli slotów
      handleReservationCreated();
      
    } catch (error) {
      console.error('Błąd podczas tworzenia rezerwacji:', error);
      alert('Wystąpił błąd podczas tworzenia rezerwacji');
    }
  };

  const handleReservationCreated = () => {
    // Ta funkcja zostanie wywołana po utworzeniu rezerwacji
    // TimeSlotTable automatycznie odświeży dane dzięki useEffect
  };

  const handleCancelReservation = () => {
    setSelectedSlot(null);
  };

  return (
    <>
      <Container className="py-4">
        <Card className="mb-4">
          <Card.Header>
            <h4 className="mb-0">
              <i className="bi bi-calendar-plus me-2"></i>
              Rezerwacja - {object.name}
            </h4>
          </Card.Header>
          <Card.Body>
            <ReservationCalendar
              objectId={objectId}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />

            <TimeSlotTable
              objectId={objectId}
              selectedDate={selectedDate}
              onTimeSlotSelect={handleTimeSlotSelect}
              timeSlotDuration={object.timeSlotDuration}
              onReservationCreated={handleReservationCreated}
            />

            <div className="mt-4">
              <Button as={Link as any} to={`/objects/${objectId}`} variant="primary">
                <i className="bi bi-arrow-left me-2"></i>
                Powrót do szczegółów obiektu
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>

      <ReservationSidebar
        isVisible={!!selectedSlot}
        selectedDate={selectedDate}
        selectedSlot={selectedSlot}
        objectName={object.name}
        timeSlotDuration={object.timeSlotDuration}
        onConfirm={handleConfirmReservation}
        onCancel={handleCancelReservation}
      />
    </>
  );
};

export default ObjectReservationPage; 