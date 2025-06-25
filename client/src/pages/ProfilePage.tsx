import React from 'react';
import { Container, Card, Row, Col, Badge } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Container className="py-4">
        <Card>
          <Card.Body className="text-center">
            <h4>Nie jesteś zalogowany</h4>
            <p>Zaloguj się, aby zobaczyć swój profil.</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge bg="danger">Administrator</Badge>;
      case 'superadmin':
        return <Badge bg="dark">Super Administrator</Badge>;
      default:
        return <Badge bg="primary">Klient</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Brak danych';
    return new Date(dateString).toLocaleString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">
        <i className="fas fa-user-circle me-2"></i>
        Mój profil
      </h2>

      <Row>
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Informacje podstawowe</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col sm={4}>
                  <strong>Imię i nazwisko:</strong>
                </Col>
                <Col sm={8}>
                  {user.name}
                </Col>
              </Row>

              <Row className="mb-3">
                <Col sm={4}>
                  <strong>Email:</strong>
                </Col>
                <Col sm={8}>
                  {user.email}
                </Col>
              </Row>

              <Row className="mb-3">
                <Col sm={4}>
                  <strong>Rola:</strong>
                </Col>
                <Col sm={8}>
                  {getRoleBadge(user.role)}
                </Col>
              </Row>

              <Row className="mb-3">
                <Col sm={4}>
                  <strong>Status konta:</strong>
                </Col>
                <Col sm={8}>
                  {user.isActive ? (
                    <Badge bg="success">Aktywne</Badge>
                  ) : (
                    <Badge bg="danger">Nieaktywne</Badge>
                  )}
                </Col>
              </Row>

              <Row className="mb-3">
                <Col sm={4}>
                  <strong>Ostatnie logowanie:</strong>
                </Col>
                <Col sm={8}>
                  {formatDate(user.lastLoginAt)}
                </Col>
              </Row>

            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage; 