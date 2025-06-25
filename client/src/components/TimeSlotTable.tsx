import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Alert, Spinner } from 'react-bootstrap';

interface TimeSlot {
  time: string;
  isAvailable: boolean;
  isReserved: boolean;
  isBreak: boolean;
  reservationId?: number;
  reservedBy?: string;
  isPast: boolean;
}

interface TimeSlotTableProps {
  objectId: number;
  selectedDate: Date | null;
  onTimeSlotSelect: (timeSlot: TimeSlot) => void;
  timeSlotDuration?: number;
  onReservationCreated?: () => void;
}

const TimeSlotTable: React.FC<TimeSlotTableProps> = ({
  objectId,
  selectedDate,
  onTimeSlotSelect,
  timeSlotDuration = 60,
  onReservationCreated
}) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (onReservationCreated) {
      setRefreshTrigger(prev => prev + 1);
    }
  }, [onReservationCreated]);

  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 7;
    const endHour = 22;
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += timeSlotDuration) {
        if (hour === endHour && minute > 0) break;
        
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          time: timeString,
          isAvailable: true,
          isReserved: false,
          isBreak: false,
          isPast: false
        });
      }
    }
    
    return slots;
  };

  useEffect(() => {
    if (!selectedDate) {
      setTimeSlots([]);
      return;
    }

    const fetchTimeSlots = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const dateString = selectedDate.toISOString().split('T')[0];
        
        const response = await fetch(`/api/objects/${objectId}/availability/${dateString}`);
        if (!response.ok) {
          throw new Error('Nie udało się pobrać dostępnych terminów');
        }
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Błąd podczas pobierania danych');
        }
        
        if (!result.data.isOpen) {
          setTimeSlots([]);
          setError('Obiekt jest zamknięty w wybranym dniu');
          return;
        }
        
        setTimeSlots(result.data.timeSlots);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Wystąpił błąd');
        setTimeSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeSlots();
  }, [objectId, selectedDate, refreshTrigger]);

  const formatTime = (time: string): string => {
    return time;
  };

  const getSlotStatus = (slot: TimeSlot) => {
    if (slot.isReserved) {
      return {
        className: 'table-danger',
        text: `Zarezerwowane`,
        disabled: true
      };
    }
    
    if (slot.isBreak) {
      return {
        className: 'table-warning',
        text: 'Przerwa techniczna',
        disabled: true
      };
    }
    
    if (slot.isPast) {
      return {
        className: 'table-secondary',
        text: 'Przeszły termin',
        disabled: true
      };
    }
    
    if (slot.isAvailable) {
      return {
        className: 'table-success',
        text: 'Wolny termin',
        disabled: false
      };
    }
    
    return {
      className: '',
      text: 'Niedostępny',
      disabled: true
    };
  };

  if (!selectedDate) {
    return (
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">
            <i className="bi bi-clock me-2"></i>
            Dostępne godziny
          </h5>
        </Card.Header>
        <Card.Body>
          <Alert variant="info">
            <i className="bi bi-info-circle me-2"></i>
            Wybierz dzień z kalendarza powyżej, aby zobaczyć dostępne godziny
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">
          <i className="bi bi-clock me-2"></i>
          Dostępne godziny - {selectedDate.toLocaleDateString('pl-PL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </h5>
      </Card.Header>
      <Card.Body>
        {loading && (
          <div className="text-center p-4">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Ładowanie...</span>
            </Spinner>
          </div>
        )}
        
        {error && (
          <Alert variant="danger">
            <Alert.Heading>Błąd</Alert.Heading>
            <p>{error}</p>
          </Alert>
        )}
        
        {!loading && !error && (
          <div className="table-responsive">
            <Table striped bordered hover responsive>
              <thead className="table-dark">
                <tr>
                  <th>Godzina</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((slot, index) => {
                  const status = getSlotStatus(slot);
                  return (
                    <tr 
                      key={index} 
                      className={status.className}
                      onClick={() => !status.disabled && onTimeSlotSelect(slot)}
                      style={{ 
                        cursor: status.disabled ? 'not-allowed' : 'pointer',
                        opacity: status.disabled ? 0.7 : 1
                      }}
                    >
                      <td>{formatTime(slot.time)}</td>
                      <td>{status.text}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
        
        <div className="mt-3">
          <div className="d-flex flex-wrap gap-2">
            <Badge bg="success">Dostępne</Badge>
            <Badge bg="danger">Zajęte</Badge>
            <Badge bg="warning">Przerwa</Badge>
            <Badge bg="secondary">Przeszły termin</Badge>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default TimeSlotTable; 