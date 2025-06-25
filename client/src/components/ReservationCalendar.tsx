import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Badge } from 'react-bootstrap';

interface ReservationCalendarProps {
  objectId: number;
  onDateSelect: (date: Date) => void;
  selectedDate: Date | null;
}

const ReservationCalendar: React.FC<ReservationCalendarProps> = ({
  objectId,
  onDateSelect,
  selectedDate
}) => {
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);

  const generateAvailableDates = () => {
    const dates: Date[] = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  useEffect(() => {
    setAvailableDates(generateAvailableDates());
    setLoading(false);
  }, []);

  const formatDate = (date: Date): string => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Dzisiaj';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Jutro';
    } else {
      return date.toLocaleDateString('pl-PL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    }
  };

  const formatShortDate = (date: Date): string => {
    return date.toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'short'
    });
  };

  const isSelected = (date: Date): boolean => {
    return selectedDate?.toDateString() === date.toDateString();
  };

  const isToday = (date: Date): boolean => {
    return date.toDateString() === new Date().toDateString();
  };

  const isPast = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  if (loading) {
    return (
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">
            <i className="bi bi-calendar-event me-2"></i>
            Wybierz dzień rezerwacji
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Ładowanie...</span>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">
          <i className="bi bi-calendar-event me-2"></i>
          Wybierz dzień rezerwacji
        </h5>
      </Card.Header>
      <Card.Body>
        <Row className="g-2">
          {availableDates.map((date, index) => (
            <Col key={index} xs={6} sm={4} md={3} lg={2}>
              <Button
                variant={isSelected(date) ? 'primary' : 'outline-secondary'}
                className={`w-100 h-100 d-flex flex-column align-items-center justify-content-center ${
                  isPast(date) ? 'disabled' : ''
                }`}
                onClick={() => !isPast(date) && onDateSelect(date)}
                disabled={isPast(date)}
                style={{ minHeight: '80px' }}
              >
                <div className="fw-bold">
                  {formatShortDate(date)}
                </div>
                <div className="small text-muted">
                  {formatDate(date)}
                </div>
                {isToday(date) && (
                  <Badge bg="success" className="mt-1">
                    Dzisiaj
                  </Badge>
                )}
                {isPast(date) && (
                  <Badge bg="secondary" className="mt-1">
                    Przeszłość
                  </Badge>
                )}
              </Button>
            </Col>
          ))}
        </Row>
        
        {selectedDate && (
          <div className="mt-3 p-3 bg-light rounded">
            <h6 className="mb-2">
              <i className="bi bi-check-circle text-success me-2"></i>
              Wybrany dzień: {formatDate(selectedDate)}
            </h6>
            <p className="mb-0 text-muted">
              Kliknij na godzinę poniżej, aby zarezerwować termin
            </p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ReservationCalendar; 