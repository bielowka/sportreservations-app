import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';

interface TimeSlot {
  time: string;
  isAvailable: boolean;
  isReserved: boolean;
  isBreak: boolean;
}

interface ReservationSidebarProps {
  isVisible: boolean;
  selectedDate: Date | null;
  selectedSlot: TimeSlot | null;
  objectName: string;
  timeSlotDuration: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const ReservationSidebar: React.FC<ReservationSidebarProps> = ({
  isVisible,
  selectedDate,
  selectedSlot,
  objectName,
  timeSlotDuration,
  onConfirm,
  onCancel
}) => {
  if (!isVisible || !selectedSlot) {
    return null;
  }

  return (
    <div
      className="position-fixed top-0 end-0 h-100 bg-white shadow-lg"
      style={{
        width: '400px',
        zIndex: 1050,
        transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease-in-out',
        borderLeft: '1px solid #dee2e6'
      }}
    >
      <Card className="h-100 border-0 rounded-0">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">
            <i className="bi bi-calendar-check me-2"></i>
            Potwierdzenie rezerwacji
          </h5>
        </Card.Header>
        <Card.Body className="d-flex flex-column">
          <div className="flex-grow-1">
            <h6 className="text-muted mb-3">Szczegóły rezerwacji</h6>
            
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">Obiekt:</span>
                <span className="fw-bold">{objectName}</span>
              </div>
              
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">Data:</span>
                <span className="fw-bold">
                  {selectedDate?.toLocaleDateString('pl-PL', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">Godzina:</span>
                <Badge bg="primary" className="fs-6">
                  {selectedSlot.time}
                </Badge>
              </div>
              
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">Długość:</span>
                <span className="fw-bold">{timeSlotDuration} minut</span>
              </div>
            </div>

            <hr />

            <div className="mb-4">
              <h6 className="text-muted mb-3">Regulamin</h6>
              <div className="small text-muted">
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <i className="bi bi-check-circle text-success me-2"></i>
                    Rezerwacja jest wiążąca
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle text-success me-2"></i>
                    Możliwość anulowania do 24h przed
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle text-success me-2"></i>
                    Prosimy o punktualność
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-auto">
            <div className="d-grid gap-2">
              <Button 
                variant="success" 
                size="lg"
                onClick={onConfirm}
                className="mb-2"
              >
                <i className="bi bi-check-circle me-2"></i>
                Potwierdź rezerwację
              </Button>
              
              <Button 
                variant="outline-secondary" 
                onClick={onCancel}
              >
                <i className="bi bi-x-circle me-2"></i>
                Anuluj
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ReservationSidebar; 