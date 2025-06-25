import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface SportObject {
  id: number;
  name: string;
  description: string;
  objectType: string;
  location: string;
  pricePerHour: number;
  isActive: boolean;
  createdAt: string;
  reservations: Array<{
    id: number;
    startTime: string;
    endTime: string;
    status: string;
  }>;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const MyObjectsPage: React.FC = () => {
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
    limit: 10,
    totalPages: 0
  });
  
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Sprawdź czy użytkownik jest administratorem
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Sprawdź komunikaty o sukcesie z navigation state
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Wyczyść state po wyświetleniu komunikatu
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  const fetchObjects = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (search) params.append('search', search);
      if (typeFilter) params.append('type', typeFilter);
      if (locationFilter) params.append('location', locationFilter);
      
      const response = await fetch(`/api/objects/my?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Błąd podczas pobierania obiektów');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setObjects(result.data);
        setPagination(result.pagination);
      } else {
        setError(result.message || 'Błąd podczas pobierania obiektów');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd podczas pobierania obiektów');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchObjects();
    }
  }, [user]);

  const handleSearch = () => {
    fetchObjects(1);
  };

  const handlePageChange = (newPage: number) => {
    fetchObjects(newPage);
  };

  const handleEditObject = (objectId: number) => {
    navigate(`/objects/${objectId}/edit`);
  };

  const handleViewReservations = (objectId: number) => {
    navigate(`/objects/${objectId}`);
  };

  const getActiveReservationsCount = (object: SportObject) => {
    return object.reservations?.length || 0;
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          Brak dostępu. Tylko administratorzy mogą przeglądać swoje obiekty.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Moje obiekty sportowe</h2>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/objects/add')}
            >
              <i className="fas fa-plus me-2"></i>
              Dodaj nowy obiekt
            </button>
          </div>

          {/* Komunikat o sukcesie */}
          {successMessage && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <i className="fas fa-check-circle me-2"></i>
              {successMessage}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setSuccessMessage(null)}
                aria-label="Close"
              ></button>
            </div>
          )}

          {/* Filtry wyszukiwania */}
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

          {/* Lista obiektów */}
          {loading ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Ładowanie...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : objects.length === 0 ? (
            <div className="alert alert-info">
              Nie masz jeszcze żadnych obiektów sportowych. 
              <button 
                className="btn btn-link p-0 ms-2"
                onClick={() => navigate('/objects/add')}
              >
                Dodaj pierwszy obiekt
              </button>
            </div>
          ) : (
            <>
              <div className="row">
                {objects.map((object) => (
                  <div key={object.id} className="col-md-6 col-lg-4 mb-4">
                    <div className="card h-100">
                      <div className="card-body">
                        <h5 className="card-title">{object.name}</h5>
                        <p className="card-text text-muted">{object.description}</p>
                        
                        <div className="mb-3">
                          <span className="badge bg-primary me-2">
                            {object.objectType}
                          </span>
                          <span className="badge bg-secondary">
                            {object.location}
                          </span>
                        </div>
                        
                        <div className="mb-3">
                          <strong>Cena za godzinę:</strong> {object.pricePerHour} zł
                        </div>
                        
                        <div className="mb-3">
                          <small className="text-muted">
                            Aktywne rezerwacje: {getActiveReservationsCount(object)}
                          </small>
                        </div>
                        
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleViewReservations(object.id)}
                          >
                            <i className="fas fa-calendar me-1"></i>
                            Rezerwacje
                          </button>
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => handleEditObject(object.id)}
                          >
                            <i className="fas fa-edit me-1"></i>
                            Edytuj
                          </button>
                        </div>
                      </div>
                      <div className="card-footer text-muted">
                        <small>Utworzono: {new Date(object.createdAt).toLocaleDateString('pl-PL')}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginacja */}
              {pagination.totalPages > 1 && (
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
                    
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <li key={pageNum} className={`page-item ${pageNum === pagination.page ? 'active' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </button>
                      </li>
                    ))}
                    
                    <li className={`page-item ${pagination.page === pagination.totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                      >
                        Następna
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyObjectsPage; 