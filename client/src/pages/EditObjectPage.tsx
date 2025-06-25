import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Alert,
  Badge,
  Spinner
} from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { SportObject, ObjectType } from '../types';
import { objectsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface FormErrors {
  name?: string;
  location?: string;
  openingTime?: string;
  closingTime?: string;
  objectType?: string;
  pricePerHour?: string;
  maxCapacity?: string;
  description?: string;
}

type FormData = Omit<SportObject, 'pricePerHour' | 'maxCapacity'> & {
  pricePerHour: string;
  maxCapacity: string;
};

const EditObjectPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState<FormData | null>(null);
  const [originalObject, setOriginalObject] = useState<SportObject | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submitError, setSubmitError] = useState<string>('');
  const [accessError, setAccessError] = useState<string>('');

  const objectTypeLabels: Record<ObjectType, string> = {
    football: 'Boisko piłkarskie',
    tennis: 'Kort tenisowy',
    basketball: 'Boisko do koszykówki',
    volleyball: 'Boisko do siatkówki',
    swimming: 'Basen',
    gym: 'Siłownia',
    other: 'Inny'
  };

  useEffect(() => {
    const fetchObject = async () => {
      try {
        if (!id) return;
        const response = await objectsApi.getObject(parseInt(id, 10));
        const object = response.data;
        
        if (!object) {
          setAccessError('Obiekt nie został znaleziony');
          return;
        }

        if (!isAuthenticated || user?.id !== object.ownerId) {
          setAccessError('Brak dostępu do edycji tego obiektu');
          return;
        }

        setOriginalObject(object);
        setFormData({
          ...object,
          pricePerHour: object.pricePerHour.toString(),
          maxCapacity: object.maxCapacity.toString()
        });
      } catch (error) {
        console.error('Error fetching object:', error);
        setAccessError('Wystąpił błąd podczas ładowania obiektu');
      } finally {
        setIsLoading(false);
      }
    };

    fetchObject();
  }, [id, user, isAuthenticated]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? {
      ...prev,
      [name]: value
    } : null);
    
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    if (!formData?.name) {
      newErrors.name = 'Nazwa jest wymagana';
    }
    
    if (!formData?.location) {
      newErrors.location = 'Lokalizacja jest wymagana';
    }
    
    if (!formData?.openingTime) {
      newErrors.openingTime = 'Godzina otwarcia jest wymagana';
    }
    
    if (!formData?.closingTime) {
      newErrors.closingTime = 'Godzina zamknięcia jest wymagana';
    }

    const getMinutes = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      return (hours || 0) * 60 + (minutes || 0);
    };
    
    if (formData?.openingTime && formData?.closingTime) {
      const openingMinutes = getMinutes(formData.openingTime);
      const closingMinutes = getMinutes(formData.closingTime);
      
      if (!isNaN(openingMinutes) && !isNaN(closingMinutes) && openingMinutes >= closingMinutes) {
        newErrors.closingTime = 'Godzina zamknięcia musi być późniejsza niż otwarcia';
      }
    }
    
    if (!formData?.objectType) {
      newErrors.objectType = 'Typ obiektu jest wymagany';
    }
    
    if (formData?.pricePerHour) {
      const price = parseFloat(formData.pricePerHour);
      if (isNaN(price) || price < 0) {
        newErrors.pricePerHour = 'Cena nie może być ujemna';
      }
    } else {
      newErrors.pricePerHour = 'Cena jest wymagana';
    }
    
    if (formData?.maxCapacity) {
      const capacity = parseInt(formData.maxCapacity, 10);
      if (isNaN(capacity) || capacity < 1) {
        newErrors.maxCapacity = 'Pojemność musi być większa od 0';
      }
    } else {
      newErrors.maxCapacity = 'Pojemność jest wymagana';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !id) return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const updatedObject: SportObject = {
        ...formData,
        pricePerHour: parseFloat(formData.pricePerHour),
        maxCapacity: parseInt(formData.maxCapacity, 10)
      };

      await objectsApi.updateObject(parseInt(id, 10), updatedObject);
      navigate(`/objects/${id}`);
    } catch (error) {
      console.error('Error updating object:', error);
      setSubmitError('Wystąpił błąd podczas aktualizacji obiektu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasChanges = () => {
    if (!formData || !originalObject) return false;
    
    return (
      formData.name !== originalObject.name ||
      formData.location !== originalObject.location ||
      formData.openingTime !== originalObject.openingTime ||
      formData.closingTime !== originalObject.closingTime ||
      formData.objectType !== originalObject.objectType ||
      Math.abs(parseFloat(formData.pricePerHour) - originalObject.pricePerHour) > 0.001 ||
      parseInt(formData.maxCapacity, 10) !== originalObject.maxCapacity ||
      formData.description !== originalObject.description
    );
  };

  if (!isAuthenticated) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          <Alert.Heading>Wymagane logowanie</Alert.Heading>
          <p>Musisz być zalogowany, aby edytować obiekt sportowy.</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button onClick={() => navigate('/login')} variant="primary">
              Przejdź do logowania
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Brak uprawnień</Alert.Heading>
          <p>Tylko administratorzy mogą edytować obiekty sportowe.</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button onClick={() => navigate('/')} variant="primary">
              Powrót do strony głównej
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (accessError) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Brak dostępu</Alert.Heading>
          <p>{accessError}</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button onClick={() => navigate('/objects/my')} variant="primary">
              Powrót do moich obiektów
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Ładowanie...</span>
        </Spinner>
        <p className="mt-2">Ładowanie danych obiektu...</p>
      </Container>
    );
  }

  if (!formData) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Błąd</Alert.Heading>
          <p>Nie udało się załadować danych obiektu.</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button onClick={() => navigate('/objects/my')} variant="primary">
              Powrót do moich obiektów
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>
              <i className="fas fa-edit text-primary me-2"></i>
              Edytuj obiekt sportowy
            </h1>
            <Button variant="secondary" onClick={() => navigate('/objects/my')}>
              <i className="fas fa-arrow-left me-1"></i>
              Powrót do listy
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={8} md={10} className="mx-auto">
          <Card className="shadow">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-info-circle me-2"></i>
                Informacje o obiekcie
              </h5>
            </Card.Header>
            <Card.Body>
              {submitError && (
                <Alert variant="danger" dismissible onClose={() => setSubmitError('')}>
                  <i className="fas fa-exclamation-circle me-2"></i>
                  {submitError}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="fas fa-tag me-1"></i>
                    Nazwa obiektu <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    isInvalid={!!errors.name}
                    placeholder="np. Boisko piłkarskie 'Orlik'"
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Podaj nazwę obiektu sportowego
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="fas fa-map-marker-alt me-1"></i>
                    Lokalizacja <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    isInvalid={!!errors.location}
                    placeholder="np. ul. Sportowa 1, Warszawa"
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.location}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Podaj adres lub lokalizację obiektu
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="fas fa-clock me-1"></i>
                    Godziny otwarcia <span className="text-danger">*</span>
                  </Form.Label>
                  <Row>
                    <Col md={6}>
                      <Form.Label className="small">Od:</Form.Label>
                      <Form.Control
                        type="time"
                        name="openingTime"
                        value={formData.openingTime}
                        onChange={handleInputChange}
                        isInvalid={!!errors.openingTime}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.openingTime}
                      </Form.Control.Feedback>
                    </Col>
                    <Col md={6}>
                      <Form.Label className="small">Do:</Form.Label>
                      <Form.Control
                        type="time"
                        name="closingTime"
                        value={formData.closingTime}
                        onChange={handleInputChange}
                        isInvalid={!!errors.closingTime}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.closingTime}
                      </Form.Control.Feedback>
                    </Col>
                  </Row>
                  <Form.Text className="text-muted">
                    Określ godziny otwarcia obiektu
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="fas fa-futbol me-1"></i>
                    Typ obiektu <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    name="objectType"
                    value={formData.objectType}
                    onChange={handleInputChange}
                    isInvalid={!!errors.objectType}
                    required
                  >
                    <option value="">Wybierz typ obiektu</option>
                    {Object.entries(objectTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.objectType}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Wybierz typ obiektu sportowego
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="fas fa-money-bill-wave me-1"></i>
                    Cena za godzinę (zł)
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="pricePerHour"
                    value={formData.pricePerHour}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                  <Form.Text className="text-muted">
                    Wprowadź cenę za godzinę wynajmu. Wpisz 0 dla obiektów darmowych.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="fas fa-users me-1"></i>
                    Maksymalna pojemność
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="maxCapacity"
                    value={formData.maxCapacity}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="1"
                  />
                  <Form.Text className="text-muted">
                    Maksymalna liczba osób, które mogą korzystać z obiektu jednocześnie
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="fas fa-info-circle me-1"></i>
                    Opis obiektu
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Dodatkowe informacje o obiekcie (opcjonalnie)"
                  />
                  <Form.Text className="text-muted">
                    Możesz dodać dodatkowe informacje o obiekcie
                  </Form.Text>
                </Form.Group>

                <div className="d-flex justify-content-between align-items-center">
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate('/objects/my')}
                    disabled={isSubmitting}
                  >
                    <i className="fas fa-times me-1"></i>
                    Anuluj
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Zapisywanie...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-1"></i>
                        Zapisz zmiany
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {originalObject && (
        <Row className="mt-4">
          <Col lg={8} md={10} className="mx-auto">
            <Card>
              <Card.Header className="bg-light">
                <h6 className="mb-0">
                  <i className="fas fa-eye me-2"></i>
                  Podgląd zmian
                </h6>
              </Card.Header>
              <Card.Body>
                <div className="row">
                  <div className="col-md-4"><strong>Nazwa:</strong></div>
                  <div className="col-md-8">
                    {formData.name !== originalObject.name && (
                      <Badge bg="warning" className="me-2">Zmieniono</Badge>
                    )}
                    {formData.name}
                  </div>
                  
                  <div className="col-md-4"><strong>Lokalizacja:</strong></div>
                  <div className="col-md-8">
                    {formData.location !== originalObject.location && (
                      <Badge bg="warning" className="me-2">Zmieniono</Badge>
                    )}
                    {formData.location}
                  </div>
                  
                  <div className="col-md-4"><strong>Typ obiektu:</strong></div>
                  <div className="col-md-8">
                    {formData.objectType !== originalObject.objectType && (
                      <Badge bg="warning" className="me-2">Zmieniono</Badge>
                    )}
                    <Badge bg="primary">{objectTypeLabels[formData.objectType]}</Badge>
                  </div>
                  
                  <div className="col-md-4"><strong>Godziny otwarcia:</strong></div>
                  <div className="col-md-8">
                    {(formData.openingTime !== originalObject.openingTime || 
                      formData.closingTime !== originalObject.closingTime) && (
                      <Badge bg="warning" className="me-2">Zmieniono</Badge>
                    )}
                    {formData.openingTime} - {formData.closingTime}
                  </div>
                  
                  <div className="col-md-4"><strong>Cena za godzinę:</strong></div>
                  <div className="col-md-8">
                    {formData.pricePerHour !== originalObject.pricePerHour.toString() && (
                      <Badge bg="warning" className="me-2">Zmieniono</Badge>
                    )}
                    {parseFloat(formData.pricePerHour) > 0 ? `${formData.pricePerHour} zł` : 'Darmowe'}
                  </div>
                  
                  <div className="col-md-4"><strong>Maksymalna pojemność:</strong></div>
                  <div className="col-md-8">
                    {formData.maxCapacity !== originalObject.maxCapacity.toString() && (
                      <Badge bg="warning" className="me-2">Zmieniono</Badge>
                    )}
                    {formData.maxCapacity} osób
                  </div>
                  
                  {(formData.description || originalObject.description) && (
                    <>
                      <div className="col-md-4"><strong>Opis:</strong></div>
                      <div className="col-md-8">
                        {formData.description !== originalObject.description && (
                          <Badge bg="warning" className="me-2">Zmieniono</Badge>
                        )}
                        {formData.description || <em>Brak opisu</em>}
                      </div>
                    </>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default EditObjectPage; 