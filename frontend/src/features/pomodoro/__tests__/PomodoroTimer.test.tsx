import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../shared/context/AuthContext';
import { PomodoroTimer } from '../PomodoroTimer';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock Notification
const mockNotification = jest.fn();
Object.defineProperty(window, 'Notification', {
  writable: true,
  value: mockNotification,
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('PomodoroTimer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render timer with initial state', () => {
    renderWithProviders(<PomodoroTimer />);

    expect(screen.getByText('25:00')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  it('should start timer when start button is clicked', async () => {
    renderWithProviders(<PomodoroTimer />);

    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);

    expect(screen.getByText('Pause')).toBeInTheDocument();

    // Fast forward time
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByText('24:59')).toBeInTheDocument();
    });
  });

  it('should pause timer when pause button is clicked', async () => {
    renderWithProviders(<PomodoroTimer />);

    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);

    // Fast forward time
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    const pauseButton = screen.getByText('Pause');
    fireEvent.click(pauseButton);

    expect(screen.getByText('Start')).toBeInTheDocument();
    
    // Timer should not change after pause
    const timeDisplay = screen.getByText('24:55');
    expect(timeDisplay).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Time should still be the same
    expect(screen.getByText('24:55')).toBeInTheDocument();
  });

  it('should reset timer when reset button is clicked', () => {
    renderWithProviders(<PomodoroTimer />);

    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);

    // Fast forward time
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);

    expect(screen.getByText('25:00')).toBeInTheDocument();
    expect(screen.getByText('Start')).toBeInTheDocument();
  });

  it('should switch to break mode after work session', async () => {
    renderWithProviders(<PomodoroTimer />);

    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);

    // Fast forward to end of work session (25 minutes)
    act(() => {
      jest.advanceTimersByTime(25 * 60 * 1000);
    });

    await waitFor(() => {
      expect(screen.getByText('5:00')).toBeInTheDocument();
      expect(screen.getByText('Break')).toBeInTheDocument();
    });
  });

  it('should switch to long break after 4 work sessions', async () => {
    renderWithProviders(<PomodoroTimer />);

    // Complete 4 work sessions
    for (let i = 0; i < 4; i++) {
      const startButton = screen.getByText('Start');
      fireEvent.click(startButton);

      // Fast forward through work session
      act(() => {
        jest.advanceTimersByTime(25 * 60 * 1000);
      });

      // Fast forward through break
      act(() => {
        jest.advanceTimersByTime(5 * 60 * 1000);
      });
    }

    await waitFor(() => {
      expect(screen.getByText('15:00')).toBeInTheDocument();
      expect(screen.getByText('Long Break')).toBeInTheDocument();
    });
  });

  it('should show notification when session ends', async () => {
    mockNotification.mockImplementation(() => ({
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));

    renderWithProviders(<PomodoroTimer />);

    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);

    // Fast forward to end of work session
    act(() => {
      jest.advanceTimersByTime(25 * 60 * 1000);
    });

    await waitFor(() => {
      expect(mockNotification).toHaveBeenCalledWith(
        'Work Session Complete!',
        expect.objectContaining({
          body: 'Great job! Time for a break.',
          tag: 'pomodoro-timer',
        })
      );
    });
  });

  it('should persist timer state in localStorage', () => {
    const savedState = {
      seconds: 1200, // 20 minutes
      isActive: true,
      mode: 'work',
      completedSessions: 2,
      totalWorkTime: 3000,
      startTime: Date.now() - 60000, // 1 minute ago
    };

    localStorage.setItem('pomodoroTimerState', JSON.stringify(savedState));

    renderWithProviders(<PomodoroTimer />);

    expect(screen.getByText('20:00')).toBeInTheDocument();
    expect(screen.getByText('Pause')).toBeInTheDocument();
  });

  it('should update localStorage when timer state changes', () => {
    renderWithProviders(<PomodoroTimer />);

    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'pomodoroTimerState',
      expect.stringContaining('"isActive":true')
    );
  });

  it('should display session statistics', () => {
    renderWithProviders(<PomodoroTimer />);

    expect(screen.getByText('Completed Sessions: 0')).toBeInTheDocument();
    expect(screen.getByText('Total Work Time: 0h 0m')).toBeInTheDocument();
  });

  it('should update statistics after session completion', async () => {
    renderWithProviders(<PomodoroTimer />);

    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);

    // Complete a work session
    act(() => {
      jest.advanceTimersByTime(25 * 60 * 1000);
    });

    await waitFor(() => {
      expect(screen.getByText('Completed Sessions: 1')).toBeInTheDocument();
      expect(screen.getByText('Total Work Time: 0h 25m')).toBeInTheDocument();
    });
  });

  it('should handle mode switching correctly', () => {
    renderWithProviders(<PomodoroTimer />);

    // Start work session
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);

    // Complete work session
    act(() => {
      jest.advanceTimersByTime(25 * 60 * 1000);
    });

    // Should be in break mode
    expect(screen.getByText('Break')).toBeInTheDocument();
    expect(screen.getByText('5:00')).toBeInTheDocument();

    // Complete break
    act(() => {
      jest.advanceTimersByTime(5 * 60 * 1000);
    });

    // Should be back to work mode
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('25:00')).toBeInTheDocument();
  });

  it('should have proper cursor styles for interactive elements', () => {
    renderWithProviders(<PomodoroTimer />);

    const startButton = screen.getByText('Start');
    const resetButton = screen.getByText('Reset');

    expect(startButton).toHaveStyle('cursor: pointer');
    expect(resetButton).toHaveStyle('cursor: pointer');
  });

  it('should be responsive on different screen sizes', () => {
    const { container } = renderWithProviders(<PomodoroTimer />);

    // Check for responsive classes
    expect(container.querySelector('.text-4xl')).toBeInTheDocument();
    expect(container.querySelector('.md\\:text-6xl')).toBeInTheDocument();
  });
});
