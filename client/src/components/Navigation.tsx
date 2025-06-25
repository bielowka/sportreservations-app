import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <i className="fas fa-futbol me-2"></i>
          Sport Reservations
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              <i className="fas fa-home me-1"></i>
              Strona główna
            </Nav.Link>
            {(!user || user.role === 'client') && (
              <Nav.Link as={Link} to="/objects">
                <i className="fas fa-futbol me-1"></i>
                Obiekty sportowe
              </Nav.Link>
            )}
            {user?.role === 'admin' && (
              <Nav.Link as={Link} to="/objects/add">
                <i className="fas fa-plus me-1"></i>
                Dodaj obiekt
              </Nav.Link>
            )}
            {user?.role === 'admin' && (
              <Nav.Link as={Link} to="/objects/my">
                <i className="fas fa-building me-1"></i>
                Moje obiekty
              </Nav.Link>
            )}
            <Nav.Link as={Link} to="/reservations">
              <i className="fas fa-calendar me-1"></i>
              Moje rezerwacje
            </Nav.Link>
          </Nav>
          
          <Nav>
            {isAuthenticated ? (
              <NavDropdown 
                title={
                  <span>
                    <i className="fas fa-user me-1"></i>
                    {user?.name}
                  </span>
                } 
                id="basic-nav-dropdown"
              >
                <NavDropdown.Item as={Link} to="/profile">
                  <i className="fas fa-user-cog me-1"></i>
                  Profil
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/reservations">
                  <i className="fas fa-calendar-check me-1"></i>
                  Moje rezerwacje
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt me-1"></i>
                  Wyloguj
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  <i className="fas fa-sign-in-alt me-1"></i>
                  Zaloguj
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  <i className="fas fa-user-plus me-1"></i>
                  Zarejestruj
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation; 