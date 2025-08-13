import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../shared/context/AuthContext';
import { AchievementsWidget } from '../AchievementsWidget';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockUser = {
  id: 1,
  email: 'test@test.com',
  username: 'testuser',
  healthScore: 100,
  level: 5,
  experience: 250,
  badges: ['first-badge', 'second-badge']
};

const mockAchievements = [
  {
    type: 'productivity',
    name: 'First Steps',
    description: 'Complete your first work session',
    icon: '🎯',
    points: 10,
    earnedAt: '2024-01-01T10:00:00Z',
    progress: 1,
    maxProgress: 1,
    rarity: 'common'
  },
  {
    type: 'health',
    name: 'Vision Master',
    description: 'Complete 10 vision reminders',
    icon: '👁️',
    points: 25,
    earnedAt: '2024-01-02T15:30:00Z',
    progress: 10,
    maxProgress: 10,
    rarity: 'rare'
  }
];

const mockUserAchievements = {
  achievements: mockAchievements,
  badges: ['first-badge', 'second-badge'],
  healthScore: 100,
  level: 5,
  experience: 250
};

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
    user: mockUser,
    token: 'mock-token',
  }),
}));

describe('AchievementsWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render user profile information', () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserAchievements
    });

    renderWithProviders(<AchievementsWidget />);

    expect(screen.getByText('Your Profile')).toBeInTheDocument();
    expect(screen.getByText('Level 5')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Health Points')).toBeInTheDocument();
  });

  it('should display achievements when loaded', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserAchievements
    });

    renderWithProviders(<AchievementsWidget />);

    await waitFor(() => {
      expect(screen.getByText('First Steps')).toBeInTheDocument();
      expect(screen.getByText('Vision Master')).toBeInTheDocument();
      expect(screen.getByText('Complete your first work session')).toBeInTheDocument();
      expect(screen.getByText('Complete 10 vision reminders')).toBeInTheDocument();
    });
  });

  it('should display achievement icons', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserAchievements
    });

    renderWithProviders(<AchievementsWidget />);

    await waitFor(() => {
      expect(screen.getByText('🎯')).toBeInTheDocument();
      expect(screen.getByText('👁️')).toBeInTheDocument();
    });
  });

  it('should display achievement points', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserAchievements
    });

    renderWithProviders(<AchievementsWidget />);

    await waitFor(() => {
      expect(screen.getByText('+10')).toBeInTheDocument();
      expect(screen.getByText('+25')).toBeInTheDocument();
    });
  });

  it('should display unlock dates', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserAchievements
    });

    renderWithProviders(<AchievementsWidget />);

    await waitFor(() => {
      expect(screen.getByText(/Jan 1, 2024/)).toBeInTheDocument();
      expect(screen.getByText(/Jan 2, 2024/)).toBeInTheDocument();
    });
  });

  it('should handle loading state', () => {
    mockFetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    renderWithProviders(<AchievementsWidget />);

    // The component shows a loading skeleton, not text
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('should handle error state', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    renderWithProviders(<AchievementsWidget />);

    // The component doesn't show error text, it just doesn't load achievements
    await waitFor(() => {
      expect(screen.getByText('Your Profile')).toBeInTheDocument();
      expect(screen.queryByText('First Steps')).not.toBeInTheDocument();
    });
  });

  it('should handle empty achievements list', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockUserAchievements, achievements: [] })
    });

    renderWithProviders(<AchievementsWidget />);

    await waitFor(() => {
      expect(screen.getByText('Your Profile')).toBeInTheDocument();
      expect(screen.queryByText('Earned Achievements')).not.toBeInTheDocument();
    });
  });

  it('should display correct badge count', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserAchievements
    });

    renderWithProviders(<AchievementsWidget />);

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Badges')).toBeInTheDocument();
    });
  });

  it('should handle user with no badges', async () => {
    const userWithoutBadges = { ...mockUser, badges: [] };
    const userAchievementsWithoutBadges = { ...mockUserAchievements, badges: [] };
    
    jest.doMock('../../../shared/context/AuthContext', () => ({
      ...jest.requireActual('../../../shared/context/AuthContext'),
      useAuth: () => ({
        user: userWithoutBadges,
        token: 'mock-token',
      }),
    }));

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => userAchievementsWithoutBadges
    });

    renderWithProviders(<AchievementsWidget />);

    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('Badges')).toBeInTheDocument();
    });
  });

  it('should be responsive on different screen sizes', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserAchievements
    });

    const { container } = renderWithProviders(<AchievementsWidget />);

    await waitFor(() => {
      // Check for grid classes that are actually used
      expect(container.querySelector('.grid')).toBeInTheDocument();
      expect(container.querySelector('.grid-cols-3')).toBeInTheDocument();
    });
  });

  it('should have proper styling for achievement cards', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserAchievements
    });

    const { container } = renderWithProviders(<AchievementsWidget />);

    await waitFor(() => {
      const achievementCards = container.querySelectorAll('.bg-gray-50');
      expect(achievementCards.length).toBeGreaterThan(0);
    });
  });

  it('should display progress bar for experience', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserAchievements
    });

    const { container } = renderWithProviders(<AchievementsWidget />);

    await waitFor(() => {
      const progressBar = container.querySelector('.bg-indigo-600');
      expect(progressBar).toBeInTheDocument();
    });
  });

  it('should handle server error response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Server error' })
    });

    renderWithProviders(<AchievementsWidget />);

    await waitFor(() => {
      // The component doesn't show error text, it just doesn't load achievements
      expect(screen.getByText('Your Profile')).toBeInTheDocument();
      expect(screen.queryByText('First Steps')).not.toBeInTheDocument();
    });
  });

  it('should make correct API call', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserAchievements
    });

    renderWithProviders(<AchievementsWidget />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/gamification/user-achievements',
        expect.objectContaining({
          headers: {
            'Authorization': 'Bearer mock-token',
          },
        })
      );
    });
  });
});

