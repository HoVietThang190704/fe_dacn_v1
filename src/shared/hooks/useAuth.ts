import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, LoginRequest, RegisterRequest } from '@/lib/api';

interface User {
  id: string;
  email: string;
  userName: string;
  phone: string;
  role: string;
  isVerified: boolean;
}

export function useAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('authToken');
        const savedUser = localStorage.getItem('user');
        
        if (token && savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await authAPI.login(credentials);
      
      if (result.success && result.data) {
        if (result.data.token && result.data.user) {
          localStorage.setItem('authToken', result.data.token);
          localStorage.setItem('user', JSON.stringify(result.data.user));
          setUser(result.data.user);
          setIsAuthenticated(true);
        }

        router.push('/main');
        return true;
      } else {
        setError(result.error || 'Login failed');
        return false;
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { fullName: string; email: string; password: string }) => {
    setIsLoading(true);
    setError('');

    try {
      // Map frontend data to backend format
      const registerData: RegisterRequest = {
        email: userData.email,
        password: userData.password,
        userName: userData.fullName
      };

      const result = await authAPI.register(registerData);
      
      if (result.success && result.data) {
        if (result.data.token && result.data.user) {
          localStorage.setItem('authToken', result.data.token);
          localStorage.setItem('user', JSON.stringify(result.data.user));
          setUser(result.data.user);
          setIsAuthenticated(true);
        }

        router.push('/main');
        return true;
      } else {
        setError(result.error || 'Registration failed');
        return false;
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
      console.error('Register error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      console.log('Google login not implemented yet');
      setError('Google login not implemented yet');
    } catch (error) {
      setError('Google login failed');
      console.error('Google login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    router.push('/auth/login');
  };

  return { 
    login, 
    register, 
    loginWithGoogle, 
    logout, 
    isLoading, 
    error, 
    user, 
    isAuthenticated 
  };
}