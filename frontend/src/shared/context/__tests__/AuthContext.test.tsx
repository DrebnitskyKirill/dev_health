import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock fetch
global.fetch = jest.fn();

// Test component that uses the context
const TestComponent = () => {
  const { user, token, isLoading, error, login, register, logout, updateUser } = useAuth();
  
  return (
    <div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'no-user'}</div>
      <div data-testid="token">{token || 'no-token'}</div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <button onClick={() => login('test@test.com', 'password')}>Login</button>
      <button onClick={() => register('test@test.com', 'password', 'testuser')}>Register</button>
      <button onClick={logout}>Logout</button>
      <button onClick={() => updateUser({ ...user, username: 'newuser' })}>Update User</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should provide initial state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('token')).toHaveTextContent('no-token');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
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
      badges: [],
    };

    const mockResponse = {
      ok: true,
      json: async () => ({
        token: 'test-token',
        user: mockUser,
      }),
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
    localStorageMock.setItem.mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('token')).toHaveTextContent('test-token');
      expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
    });
  });

  it('should handle login error', async () => {
    const mockResponse = {
      ok: false,
      json: async () => ({
        error: 'Login failed',
      }),
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Login failed');
    });
  });

  it('should handle successful registration', async () => {
    const mockUser = {
      id: 1,
      email: 'test@test.com',
      username: 'testuser',
      healthScore: 100,
      level: 1,
      experience: 50,
      badges: [],
    };

    const mockResponse = {
      ok: true,
      json: async () => ({
        token: 'test-token',
        user: mockUser,
      }),
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
    localStorageMock.setItem.mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Register'));

    await waitFor(() => {
      expect(screen.getByTestId('token')).toHaveTextContent('test-token');
      expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
    });
  });

  it('should handle logout', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Logout'));

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
  });

  it('should update user data', async () => {
    const mockUser = {
      id: 1,
      email: 'test@test.com',
      username: 'testuser',
      healthScore: 100,
      level: 1,
      experience: 50,
      badges: [],
    };

    // Set initial user state by simulating a successful login first
    const mockLoginResponse = {
      ok: true,
      json: async () => ({
        token: 'test-token',
        user: mockUser,
      }),
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockLoginResponse);
    localStorageMock.setItem.mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Login first to set user state
    fireEvent.click(screen.getByText('Login'));

    // Wait for login to complete
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
    });

    // Now update user
    fireEvent.click(screen.getByText('Update User'));

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify({
        ...mockUser,
        username: 'newuser'
      }));
    });
  });

  it('should handle invalid token', async () => {
    localStorageMock.getItem.mockReturnValue('invalid-token');

    const mockResponse = {
      ok: false,
      status: 401,
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    });
  });
});
