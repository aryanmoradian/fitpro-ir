
import React from 'react';
import AuthPage from '../components/AuthPage';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleAuthSuccess = (user: any) => {
    // Note: Token and User state are handled inside AuthPage via Context,
    // but here we handle navigation after success.
    if (user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  return <AuthPage onAuthSuccess={handleAuthSuccess} initialMode="login" />;
};

export default Login;
