import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SportObject, ObjectFilters, ObjectType } from '../types';
import { objectsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ObjectsListPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [objects, setObjects] = useState<SportObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 6,
    totalPages: 0
  });

  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/objects/my');
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      fetchObjects();
    }
    
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, user]);

  const fetchObjects = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: ObjectFilters = {
        page,
        limit: 6
      };
      
      if (search) filters.search = search;
      if (typeFilter) filters.type = typeFilter as ObjectType;
      if (locationFilter) filters.location = locationFilter;
      
      const response = await objectsApi.getObjects(filters);
      
      if (response.success) {
        console.log('Pagination data:', {
          total: response.pagination?.total,
          limit: response.pagination?.limit,
          totalPages: response.pagination?.totalPages,
          calculatedPages: Math.ceil((response.pagination?.total || 0) / (response.pagination?.limit || 6))
        });
        setObjects(response.data || []);
        setPagination(response.pagination || {
          total: 0,
          page: 1,
          limit: 6,
          totalPages: 0
        });
      } else {
        setError(response.message || 'Nie udało się pobrać listy obiektów sportowych');
      }
    } catch (err) {
      console.error('Error fetching objects:', err);
      setError('Nie udało się pobrać listy obiektów sportowych');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchObjects(1);
  };

  const handlePageChange = (newPage: number) => {
    fetchObjects(newPage);
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

  if (loading) {
    return (
      <Container>
        <Row>
          <Col className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Ładowanie...</span>
            </Spinner>
            <p className="mt-3">Ładowanie obiektów sportowych...</p>
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
              <Button variant="outline-danger" onClick={() => fetchObjects(1)}>
                Spróbuj ponownie
              </Button>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container>
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>
              <i className="fas fa-futbol text-primary me-2"></i>
              Obiekty sportowe
            </h1>
          </div>
        </Col>
      </Row>

      {successMessage && (
        <Row>
          <Col>
            <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)}>
              <i className="fas fa-check-circle me-2"></i>
              {successMessage}
            </Alert>
          </Col>
        </Row>
      )}

      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Szukaj po nazwie..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">Wszystkie typy</option>
                <option value="tennis">Tenis</option>
                <option value="football">Piłka nożna</option>
                <option value="basketball">Koszykówka</option>
                <option value="volleyball">Siatkówka</option>
                <option value="swimming">Pływanie</option>
                <option value="gym">Siłownia</option>
              </select>
            </div>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Lokalizacja..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="col-md-3">
              <button 
                className="btn btn-outline-primary w-100"
                onClick={handleSearch}
              >
                <i className="fas fa-search me-2"></i>
                Szukaj
              </button>
            </div>
          </div>
        </div>
      </div>

      {objects.length === 0 && pagination.total === 0 ? (
        <Row>
          <Col>
            <Card>
              <Card.Body className="text-center py-5">
                <i className="fas fa-futbol fa-4x text-muted mb-3"></i>
                <h4 className="text-muted">Brak obiektów sportowych</h4>
                <p className="text-muted">Nie ma jeszcze żadnych obiektów sportowych w systemie.</p>
                <Link to="/objects/add">
                  <Button variant="primary">
                    <i className="fas fa-plus me-1"></i>
                    Dodaj pierwszy obiekt
                  </Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : objects.length === 0 ? (
        <Row>
          <Col>
            <Card>
              <Card.Body className="text-center py-5">
                <i className="fas fa-search fa-4x text-muted mb-3"></i>
                <h4 className="text-muted">Nie znaleziono obiektów</h4>
                <p className="text-muted">Nie znaleziono obiektów spełniających kryteria wyszukiwania.</p>
                <Button variant="outline-primary" onClick={() => {
                  setSearch('');
                  setTypeFilter('');
                  setLocationFilter('');
                  fetchObjects(1);
                }}>
                  <i className="fas fa-times me-1"></i>
                  Wyczyść filtry
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : (
        <>
          <Row>
            {objects.map((object) => (
              <Col key={object.id} lg={4} md={6} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="card-title mb-0">{object.name}</h5>
                      <Badge bg="primary" className="ms-2">
                        <i className={`${getObjectTypeIcon(object.objectType)} me-1`}></i>
                        {getObjectTypeLabel(object.objectType)}
                      </Badge>
                    </div>
                    
                    <p className="text-muted mb-2">
                      <i className="fas fa-map-marker-alt me-1"></i>
                      {object.location}
                    </p>
                    
                    <p className="text-muted mb-2">
                      <i className="fas fa-clock me-1"></i>
                      {object.openingTime} - {object.closingTime}
                    </p>
                    
                    {object.description && (
                      <p className="card-text text-muted mb-3">
                        {object.description.length > 100 
                          ? `${object.description.substring(0, 100)}...` 
                          : object.description}
                      </p>
                    )}
                    
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        {object.pricePerHour > 0 && (
                          <span className="text-success fw-bold">
                            {object.pricePerHour} zł/h
                          </span>
                        )}
                        {object.pricePerHour === 0 && (
                          <span className="text-success fw-bold">Darmowe</span>
                        )}
                      </div>
                      <Link to={`/objects/${object.id}`}>
                        <Button variant="outline-primary" size="sm">
                          Szczegóły
                        </Button>
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {pagination.total > 6 && (
            <nav aria-label="Nawigacja stron">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Poprzednia
                  </button>
                </li>
                
                {(() => {
                  const pages = [];
                  const numPages = Math.ceil(pagination.total / pagination.limit);
                  
                  for (let i = 1; i <= numPages; i++) {
                    pages.push(
                      <li key={i} className={`page-item ${i === pagination.page ? 'active' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(i)}
                        >
                          {i}
                        </button>
                      </li>
                    );
                  }
                  
                  return pages;
                })()}
                
                <li className={`page-item ${pagination.page === Math.ceil(pagination.total / pagination.limit) ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === Math.ceil(pagination.total / pagination.limit)}
                  >
                    Następna
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </Container>
  );
};

export default ObjectsListPage; 