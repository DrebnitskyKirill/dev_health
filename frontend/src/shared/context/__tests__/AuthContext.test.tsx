import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Test component to access context
const TestComponent = () => {
  const { user, token, login, register, logout, updateUser, isLoading, error } = useAuth();
  
  return (
    <div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'no-user'}</div>
      <div data-testid="token">{token || 'no-token'}</div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <button onClick={() => login('test@test.com', 'password')}>Login</button>
      <button onClick={() => register('test@test.com', 'password', 'testuser')}>Register</button>
      <button onClick={logout}>Logout</button>
      <button onClick={() => updateUser({ username: 'newuser' })}>Update User</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should provide initial state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('token')).toHaveTextContent('no-token');
    expect(screen.getByTestId('loading')).toHaveTextContent('true');
    expect(screen.getByTestId('error')).toHaveTextContent('no-error');
  });

  it('should handle successful login', async () => {
    const mockUser = {
      id: 1,
      email: 'test@test.com',
      username: 'testuser',
      healthScore: 100,
      level: 1,
      experience: 50,
      badges: ['first-badge']
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: 'mock-token',
        user: mockUser
      })
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@test.com', password: 'password' })
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
      expect(screen.getByTestId('token')).toHaveTextContent('mock-token');
    });
  });

  it('should handle login error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid credentials' })
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials');
    });
  });

  it('should handle successful registration', async () => {
    const mockUser = {
      id: 1,
      email: 'test@test.com',
      username: 'testuser',
      healthScore: 0,
      level: 1,
      experience: 0,
      badges: []
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: 'mock-token',
        user: mockUser
      })
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Register'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/register',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: 'test@test.com', 
            password: 'password', 
            username: 'testuser' 
          })
        })
      );
    });
  });

  it('should handle logout', () => {
    // Set initial token
    localStorage.setItem('token', 'mock-token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Logout'));

    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
  });

  it('should update user data', () => {
    const mockUser = {
      id: 1,
      email: 'test@test.com',
      username: 'testuser',
      healthScore: 100,
      level: 1,
      experience: 50,
      badges: []
    };

    // Mock successful profile fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser })
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Update User'));

    expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify({
      ...mockUser,
      username: 'newuser'
    }));
  });

  it('should handle token from localStorage', async () => {
    localStorage.setItem('token', 'existing-token');
    
    const mockUser = {
      id: 1,
      email: 'test@test.com',
      username: 'testuser',
      healthScore: 100,
      level: 1,
      experience: 50,
      badges: []
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser })
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('token')).toHaveTextContent('existing-token');
    });
  });

  it('should handle invalid token', async () => {
    localStorage.setItem('token', 'invalid-token');
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid token' })
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    });
  });
});
