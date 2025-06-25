import React, { useState } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Alert,
  Badge 
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AddObjectForm, ObjectType } from '../types';
import { objectsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const AddObjectPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState<AddObjectForm>({
    name: '',
    location: '',
    openingTime: '',
    closingTime: '',
    objectType: 'football',
    description: '',
    pricePerHour: 0,
    maxCapacity: 1
  });
  const [errors, setErrors] = useState<Partial<AddObjectForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  const objectTypeLabels: Record<ObjectType, string> = {
    football: 'Boisko piłkarskie',
    tennis: 'Kort tenisowy',
    basketball: 'Boisko do koszykówki',
    volleyball: 'Boisko do siatkówki',
    swimming: 'Basen',
    gym: 'Siłownia',
    other: 'Inny'
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name as keyof AddObjectForm]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<AddObjectForm> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nazwa obiektu jest wymagana';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nazwa obiektu musi mieć minimum 2 znaki';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Lokalizacja jest wymagana';
    } else if (formData.location.trim().length < 5) {
      newErrors.location = 'Lokalizacja musi mieć minimum 5 znaków';
    }

    if (!formData.openingTime) {
      newErrors.openingTime = 'Godzina otwarcia jest wymagana';
    }

    if (!formData.closingTime) {
      newErrors.closingTime = 'Godzina zamknięcia jest wymagana';
    }

    if (formData.openingTime && formData.closingTime && 
        formData.openingTime >= formData.closingTime) {
      newErrors.closingTime = 'Godzina zamknięcia musi być późniejsza niż otwarcia';
    }

    if (formData.pricePerHour && Number(formData.pricePerHour) < 0) {
      newErrors.pricePerHour = 'Cena nie może być ujemna';
    }

    if (formData.maxCapacity && Number(formData.maxCapacity) < 1) {
      newErrors.maxCapacity = 'Maksymalna pojemność musi być większa od 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await objectsApi.addObject(formData);
      if (response.success) {
        navigate('/objects/my', { 
          state: { message: 'Obiekt sportowy został pomyślnie dodany!' }
        });
      } else {
        setSubmitError(response.message || 'Wystąpił błąd podczas dodawania obiektu');
      }
    } catch (error) {
      console.error('Error adding object:', error);
      setSubmitError('Wystąpił błąd podczas dodawania obiektu');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          <Alert.Heading>Wymagane logowanie</Alert.Heading>
          <p>Musisz być zalogowany, aby dodać obiekt sportowy.</p>
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
          <p>Tylko administratorzy mogą dodawać obiekty sportowe.</p>
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

  return (
    <Container>
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>
              <i className="fas fa-plus-circle text-primary me-2"></i>
              Dodaj obiekt sportowy
            </h1>
            <Button variant="secondary" onClick={() => navigate('/objects')}>
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
                    value={formData.description}
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
                    onClick={() => navigate('/objects')}
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
                        Dodawanie...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus me-1"></i>
                        Dodaj obiekt
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col lg={8} md={10} className="mx-auto">
          <Card>
            <Card.Header className="bg-light">
              <h6 className="mb-0">
                <i className="fas fa-eye me-2"></i>
                Podgląd obiektu
              </h6>
            </Card.Header>
            <Card.Body>
              {formData.name || formData.location || formData.objectType ? (
                <div className="row">
                  <div className="col-md-4"><strong>Nazwa:</strong></div>
                  <div className="col-md-8">{formData.name || '-'}</div>
                  <div className="col-md-4"><strong>Lokalizacja:</strong></div>
                  <div className="col-md-8">{formData.location || '-'}</div>
                  <div className="col-md-4"><strong>Typ obiektu:</strong></div>
                  <div className="col-md-8">
                    {formData.objectType ? (
                      <Badge bg="primary">{objectTypeLabels[formData.objectType]}</Badge>
                    ) : '-'}
                  </div>
                  <div className="col-md-4"><strong>Godziny otwarcia:</strong></div>
                  <div className="col-md-8">
                    {formData.openingTime && formData.closingTime 
                      ? `${formData.openingTime} - ${formData.closingTime}` 
                      : '-'}
                  </div>
                  <div className="col-md-4"><strong>Cena za godzinę:</strong></div>
                  <div className="col-md-8">
                    {formData.pricePerHour && formData.pricePerHour > 0 
                      ? `${formData.pricePerHour} zł` 
                      : 'Darmowe'}
                  </div>
                  <div className="col-md-4"><strong>Maksymalna pojemność:</strong></div>
                  <div className="col-md-8">{formData.maxCapacity || '-'} osób</div>
                  {formData.description && (
                    <>
                      <div className="col-md-4"><strong>Opis:</strong></div>
                      <div className="col-md-8">{formData.description}</div>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-center text-muted">
                  Wypełnij formularz, aby zobaczyć podgląd obiektu
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AddObjectPage; 