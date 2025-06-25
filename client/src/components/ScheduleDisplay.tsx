import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Alert, Spinner } from 'react-bootstrap';

interface Schedule {
  dayOfWeek: number;
  isOpen: boolean;
  openingTime: string | null;
  closingTime: string | null;
  breakStartTime: string | null;
  breakEndTime: string | null;
  specialNotes: string | null;
}

interface ScheduleConfig {
  objectId: number;
  objectName: string;
  useCustomSchedule: boolean;
  minReservationDuration: number;
  timeSlotDuration: number;
  advanceBookingDays: number;
  cancellationHours: number;
  schedules: Schedule[];
}

interface ScheduleDisplayProps {
  objectId: number;
}

const ScheduleDisplay: React.FC<ScheduleDisplayProps> = ({ objectId }) => {
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dayNames = [
    'Niedziela',
    'Poniedziałek', 
    'Wtorek',
    'Środa',
    'Czwartek',
    'Piątek',
    'Sobota'
  ];

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/objects/${objectId}/schedule`);
        if (!response.ok) {
          throw new Error('Nie udało się pobrać harmonogramu');
        }
        
        const data = await response.json();
        setScheduleConfig(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Wystąpił błąd');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [objectId]);

  const formatTime = (time: string | null): string => {
    if (!time) return '-';
    return time.substring(0, 5); // Usuń sekundy
  };

  const getStatusBadge = (isOpen: boolean) => {
    return isOpen ? (
      <Badge bg="success">Otwarte</Badge>
    ) : (
      <Badge bg="danger">Zamknięte</Badge>
    );
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Ładowanie...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Błąd</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }

  if (!scheduleConfig) {
    return (
      <Alert variant="warning">
        <Alert.Heading>Brak danych</Alert.Heading>
        <p>Nie udało się załadować harmonogramu.</p>
      </Alert>
    );
  }

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">
          <i className="bi bi-calendar-week me-2"></i>
          Harmonogram tygodniowy - {scheduleConfig.objectName}
        </h5>
      </Card.Header>
      <Card.Body>
        {/* Informacje o konfiguracji */}
        <div className="row mb-3">
          <div className="col-md-6">
            <small className="text-muted">
              <strong>Minimalna długość rezerwacji:</strong> {scheduleConfig.minReservationDuration} min<br />
              <strong>Długość slotu czasowego:</strong> {scheduleConfig.timeSlotDuration} min
            </small>
          </div>
          <div className="col-md-6">
            <small className="text-muted">
              <strong>Rezerwacja z wyprzedzeniem:</strong> {scheduleConfig.advanceBookingDays} dni<br />
              <strong>Anulowanie do:</strong> {scheduleConfig.cancellationHours} h przed
            </small>
          </div>
        </div>

        {/* Tabela harmonogramu */}
        <Table responsive striped hover>
          <thead>
            <tr>
              <th>Dzień tygodnia</th>
              <th>Status</th>
              <th>Godziny otwarcia</th>
              <th>Przerwa</th>
              <th>Uwagi</th>
            </tr>
          </thead>
          <tbody>
            {scheduleConfig.schedules.map((schedule) => (
              <tr key={schedule.dayOfWeek}>
                <td>
                  <strong>{dayNames[schedule.dayOfWeek]}</strong>
                </td>
                <td>
                  {getStatusBadge(schedule.isOpen)}
                </td>
                <td>
                  {schedule.isOpen ? (
                    <>
                      {formatTime(schedule.openingTime)} - {formatTime(schedule.closingTime)}
                    </>
                  ) : (
                    <span className="text-muted">Zamknięte</span>
                  )}
                </td>
                <td>
                  {schedule.breakStartTime && schedule.breakEndTime ? (
                    <>
                      {formatTime(schedule.breakStartTime)} - {formatTime(schedule.breakEndTime)}
                    </>
                  ) : (
                    <span className="text-muted">Brak przerwy</span>
                  )}
                </td>
                <td>
                  {schedule.specialNotes ? (
                    <small className="text-muted">{schedule.specialNotes}</small>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Informacja o typie harmonogramu */}
        <div className="mt-3">
          <small className="text-muted">
            <i className="bi bi-info-circle me-1"></i>
            {scheduleConfig.useCustomSchedule 
              ? 'Ten obiekt używa niestandardowego harmonogramu tygodniowego'
              : 'Ten obiekt używa standardowych godzin otwarcia dla wszystkich dni'
            }
          </small>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ScheduleDisplay; 