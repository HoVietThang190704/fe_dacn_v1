import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, LoginRequest, RegisterRequest } from '@/lib/api';
import { usersAPI } from '@/lib/api';
import { postCommentContainer } from '@/presentation/di/PostCommentContainer';

export interface User {
  id: string;
  email: string;
  userName: string;
  phone?: string;
  role: string;
  isVerified: boolean;
  avatar?: string;
}

export function useAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Helper: normalize various profile response shapes into User
  const extractProfileFromPayload = (payload: unknown): Partial<User> | null => {
    if (!payload || typeof payload !== 'object') return null;
    const p = payload as Record<string, unknown>;

    // Common shapes: { user: { ... } } OR { data: { user: { ... } } } OR direct profile object
    let candidate: Record<string, unknown> | null = null;
    if ('user' in p && typeof p.user === 'object' && p.user !== null) candidate = p.user as Record<string, unknown>;
    else if ('data' in p && typeof p.data === 'object' && p.data !== null) {
      const d = p.data as Record<string, unknown>;
      if ('user' in d && typeof d.user === 'object' && d.user !== null) candidate = d.user as Record<string, unknown>;
      else candidate = d;
    } else candidate = p;

    if (!candidate) return null;

    const out: Partial<User> = {};
    // id variants
    if ('id' in candidate && candidate.id) out.id = String(candidate.id);
    if ('email' in candidate && candidate.email) out.email = String(candidate.email);
    // name variants
    if ('userName' in candidate && candidate.userName) out.userName = String(candidate.userName);
    else if ('username' in candidate && candidate.username) out.userName = String(candidate.username);
    else if ('name' in candidate && candidate.name) out.userName = String(candidate.name);
    else if ('fullName' in candidate && candidate.fullName) out.userName = String(candidate.fullName);
    // avatar variants
    if ('avatar' in candidate && candidate.avatar) out.avatar = String(candidate.avatar);
    else if ('image' in candidate && candidate.image) out.avatar = String(candidate.image);
    else if ('avatarUrl' in candidate && candidate.avatarUrl) out.avatar = String(candidate.avatarUrl);
    // phone, role, isVerified
    if ('phone' in candidate && candidate.phone) out.phone = String(candidate.phone);
    if ('role' in candidate && candidate.role) out.role = String(candidate.role);
    if ('isVerified' in candidate) out.isVerified = Boolean(candidate.isVerified);

    return out;
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
          const userData = JSON.parse(savedUser);

          // Try to fetch fresh profile data if we have token
          try {
            const profileResult = await usersAPI.getMyProfile(token);
            console.log('Profile result on auth check:', profileResult);
            if (profileResult && profileResult.success && profileResult.data) {
              const normalized = extractProfileFromPayload(profileResult.data);
              const fullUser: User = { ...userData, ...(normalized || {}) } as User;
              console.log('Full user after merge on auth check:', fullUser);
              localStorage.setItem('user', JSON.stringify(fullUser));
              setUser(fullUser);
            } else {
              console.log('Profile fetch failed on auth check, using saved user data');
              setUser(userData);
            }
          } catch (profileError) {
            console.error('Failed to fetch profile on auth check:', profileError);
            setUser(userData);
          }

          setIsAuthenticated(true);
          // Set token to container on app start
          postCommentContainer.setAuthToken(token);
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
        if (result.data.accessToken && result.data.refreshToken && result.data.user) {
          localStorage.setItem('authToken', result.data.accessToken);
          localStorage.setItem('refreshToken', result.data.refreshToken);
          
          // Set token to container immediately after login
          postCommentContainer.setAuthToken(result.data.accessToken);
          
          // Fetch full profile to get avatar
          try {
            const profileResult = await usersAPI.getMyProfile(result.data.accessToken);
            console.log('Profile result after login:', profileResult);
            if (profileResult && profileResult.success && profileResult.data) {
              console.log('Profile data:', profileResult.data);
              const normalized = extractProfileFromPayload(profileResult.data);
              const fullUser = { ...result.data.user, ...(normalized || {}) };
              console.log('Full user after merge:', fullUser);
              localStorage.setItem('user', JSON.stringify(fullUser));
              setUser(fullUser);
            } else {
              console.log('Profile fetch failed, using login user data');
              // Fallback to login user data
              localStorage.setItem('user', JSON.stringify(result.data.user));
              setUser(result.data.user);
            }
          } catch (profileError) {
            console.error('Failed to fetch profile after login:', profileError);
            // Fallback to login user data
            localStorage.setItem('user', JSON.stringify(result.data.user));
            setUser(result.data.user);
          }
          
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
      const registerData: RegisterRequest = {
        email: userData.email,
        password: userData.password,
        userName: userData.fullName
      };

      const result = await authAPI.register(registerData);
      
      if (result.success && result.data) {
        router.push('/auth/login');
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

  const loginWithGoogle = async (idToken: string) => {
    setIsLoading(true);
    setError('');
    try {
      if (!idToken) throw new Error('No id_token received from Google');

      // Exchange id_token with backend for our app tokens & user
      const result = await authAPI.googleToken(idToken);
      if (result.success && result.data) {
        if (result.data.accessToken && result.data.refreshToken && result.data.user) {
          localStorage.setItem('authToken', result.data.accessToken);
          localStorage.setItem('refreshToken', result.data.refreshToken);

          postCommentContainer.setAuthToken(result.data.accessToken);

          // Fetch profile and store user (similar to normal login flow)
          try {
            const profileResult = await usersAPI.getMyProfile(result.data.accessToken);
            if (profileResult && profileResult.success && profileResult.data) {
              const normalized = extractProfileFromPayload(profileResult.data);
              const fullUser = { ...result.data.user, ...(normalized || {}) } as User;
              localStorage.setItem('user', JSON.stringify(fullUser));
              setUser(fullUser);
            } else {
              localStorage.setItem('user', JSON.stringify(result.data.user));
              setUser(result.data.user as User);
            }
          } catch (profileError) {
            console.error('Failed to fetch profile after google login:', profileError);
            localStorage.setItem('user', JSON.stringify(result.data.user));
            setUser(result.data.user as User);
          }

          setIsAuthenticated(true);
        }

        router.push('/main');
        return true;
      }

      setError(result.error || 'Google login failed');
      return false;
    } catch (error) {
      console.error('Google login error:', error);
      // Safely extract a string message from unknown `error`
      let errMsg = 'Google login failed';
      if (error instanceof Error && error.message) errMsg = error.message;
      else if (typeof error === 'string') errMsg = error;
      else if (error && typeof error === 'object') {
        const maybe = error as { [key: string]: unknown };
        if (typeof maybe.message === 'string') errMsg = maybe.message;
      }
      setError(errMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    // Clear token from container on logout
    postCommentContainer.setAuthToken('');
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