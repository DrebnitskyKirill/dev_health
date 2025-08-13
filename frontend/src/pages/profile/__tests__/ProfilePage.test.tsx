import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../shared/context/AuthContext';
import ProfilePage from '../ProfilePage';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

// Mock the AuthContext to provide a user
jest.mock('../../../shared/context/AuthContext', () => ({
  ...jest.requireActual('../../../shared/context/AuthContext'),
  useAuth: () => ({
    user: {
      id: 1,
      email: 'test@test.com',
      username: 'testuser',
      healthScore: 100,
      level: 5,
      experience: 250,
      badges: ['first-badge', 'second-badge']
    },
    token: 'mock-token',
    updateUser: jest.fn(),
  }),
}));

describe('ProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render profile information correctly', async () => {
    renderWithProviders(<ProfilePage />);

    // Wait for the component to load data
    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    expect(screen.getByText('test@test.com')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Health Points')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Level')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Badges')).toBeInTheDocument();
  });

  it('should show edit button initially', async () => {
    renderWithProviders(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Edit Name & Password')).toBeInTheDocument();
    });
  });

  it('should switch to edit mode when edit button is clicked', async () => {
    renderWithProviders(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Edit Name & Password')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Edit Name & Password');
    fireEvent.click(editButton);

    expect(screen.getByText('Profile Settings')).toBeInTheDocument();
    expect(screen.getByText('Password Settings')).toBeInTheDocument();
    expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
  });

  it('should handle username change', async () => {
    renderWithProviders(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Edit Name & Password')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Edit Name & Password');
    fireEvent.click(editButton);

    const usernameInput = screen.getByDisplayValue('testuser');
    fireEvent.change(usernameInput, { target: { value: 'newusername' } });

    expect(usernameInput).toHaveValue('newusername');
  });

  it('should handle password fields', async () => {
    renderWithProviders(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Edit Name & Password')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Edit Name & Password');
    fireEvent.click(editButton);

    const currentPasswordInput = screen.getByPlaceholderText('Enter current password (required for password change)');
    const newPasswordInput = screen.getByPlaceholderText('Enter new password (optional)');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm new password');

    fireEvent.change(currentPasswordInput, { target: { value: 'oldpassword' } });
    fireEvent.change(newPasswordInput, { target: { value: 'newpassword' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword' } });

    expect(currentPasswordInput).toHaveValue('oldpassword');
    expect(newPasswordInput).toHaveValue('newpassword');
    expect(confirmPasswordInput).toHaveValue('newpassword');
  });

  it('should save changes successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Profile updated successfully' })
    });

    renderWithProviders(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Edit Name & Password')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Edit Name & Password');
    fireEvent.click(editButton);

    const usernameInput = screen.getByDisplayValue('testuser');
    fireEvent.change(usernameInput, { target: { value: 'newusername' } });

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/profile',
        expect.objectContaining({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token',
          },
          body: JSON.stringify({ username: 'newusername' })
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
    });
  });

  it('should handle password change successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Password changed successfully' })
    });

    renderWithProviders(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Edit Name & Password')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Edit Name & Password');
    fireEvent.click(editButton);

    const currentPasswordInput = screen.getByPlaceholderText('Enter current password (required for password change)');
    const newPasswordInput = screen.getByPlaceholderText('Enter new password (optional)');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm new password');

    fireEvent.change(currentPasswordInput, { target: { value: 'oldpassword' } });
    fireEvent.change(newPasswordInput, { target: { value: 'newpassword' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword' } });

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/change-password',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token',
          },
          body: JSON.stringify({
            currentPassword: 'oldpassword',
            newPassword: 'newpassword'
          })
        })
      );
    });
  });

  it('should handle server errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    renderWithProviders(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Edit Name & Password')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Edit Name & Password');
    fireEvent.click(editButton);

    const usernameInput = screen.getByDisplayValue('testuser');
    fireEvent.change(usernameInput, { target: { value: 'newusername' } });

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Network error occurred')).toBeInTheDocument();
    });
  });

  it('should have proper cursor styles for interactive elements', async () => {
    renderWithProviders(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Edit Name & Password')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Edit Name & Password');
    expect(editButton).toHaveClass('cursor-pointer');
  });

  it('should be responsive on different screen sizes', async () => {
    const { container } = renderWithProviders(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Edit Name & Password')).toBeInTheDocument();
    });

    // Check for responsive grid classes
    expect(container.querySelector('.lg\\:grid-cols-3')).toBeInTheDocument();
    expect(container.querySelector('.lg\\:col-span-2')).toBeInTheDocument();
  });

  it('should clear password fields after successful save', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Profile updated successfully' })
    });

    renderWithProviders(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Edit Name & Password')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Edit Name & Password');
    fireEvent.click(editButton);

    const currentPasswordInput = screen.getByPlaceholderText('Enter current password (required for password change)');
    const newPasswordInput = screen.getByPlaceholderText('Enter new password (optional)');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm new password');

    fireEvent.change(currentPasswordInput, { target: { value: 'oldpassword' } });
    fireEvent.change(newPasswordInput, { target: { value: 'newpassword' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword' } });

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(currentPasswordInput).toHaveValue('');
      expect(newPasswordInput).toHaveValue('');
      expect(confirmPasswordInput).toHaveValue('');
    });
  });
});
