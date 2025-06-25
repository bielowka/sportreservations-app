import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = (token: string, user: any) => {
    login(token, user);
    navigate('/');
  };

  return (
    <div className="login-page">
      <LoginForm onLogin={handleLogin} />
    </div>
  );
};

export default LoginPage; 