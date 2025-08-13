import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../shared/context/AuthContext';
import { PomodoroTimer } from '../features/pomodoro/PomodoroTimer';
import { VisionReminder } from '../features/visionReminder/VisionReminder';

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

describe('Integration Tests - Gamification and Scoring', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Pomodoro Timer Integration', () => {
    it('should send statistics when work session completes', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Statistics updated' })
      });

      renderWithProviders(<PomodoroTimer />);

      const startButton = screen.getByText('Start');
      fireEvent.click(startButton);

      // Complete a work session
      act(() => {
        jest.advanceTimersByTime(25 * 60 * 1000);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/gamification/statistics',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': expect.stringContaining('Bearer'),
            },
            body: expect.stringContaining('pomodoroSessions')
          })
        );
      });
    });

    it('should track completed sessions correctly', async () => {
      renderWithProviders(<PomodoroTimer />);

      const startButton = screen.getByText('Start');
      fireEvent.click(startButton);

      // Complete a work session
      act(() => {
        jest.advanceTimersByTime(25 * 60 * 1000);
      });

      await waitFor(() => {
        expect(screen.getByText('Completed Sessions: 1')).toBeInTheDocument();
      });

      // Complete another session
      fireEvent.click(screen.getByText('Start'));
      act(() => {
        jest.advanceTimersByTime(25 * 60 * 1000);
      });

      await waitFor(() => {
        expect(screen.getByText('Completed Sessions: 2')).toBeInTheDocument();
      });
    });

    it('should calculate total work time correctly', async () => {
      renderWithProviders(<PomodoroTimer />);

      const startButton = screen.getByText('Start');
      fireEvent.click(startButton);

      // Complete a work session
      act(() => {
        jest.advanceTimersByTime(25 * 60 * 1000);
      });

      await waitFor(() => {
        expect(screen.getByText('Total Work Time: 0h 25m')).toBeInTheDocument();
      });

      // Complete another session
      fireEvent.click(screen.getByText('Start'));
      act(() => {
        jest.advanceTimersByTime(25 * 60 * 1000);
      });

      await waitFor(() => {
        expect(screen.getByText('Total Work Time: 0h 50m')).toBeInTheDocument();
      });
    });
  });

  describe('Vision Reminder Integration', () => {
    it('should send statistics when reminder completes', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Statistics updated' })
      });

      renderWithProviders(<VisionReminder />);

      const startButton = screen.getByText('Start');
      fireEvent.click(startButton);

      // Complete a vision reminder
      act(() => {
        jest.advanceTimersByTime(20 * 60 * 1000);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/gamification/statistics',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': expect.stringContaining('Bearer'),
            },
            body: expect.stringContaining('visionReminders')
          })
        );
      });
    });

    it('should track reminders shown correctly', async () => {
      renderWithProviders(<VisionReminder />);

      const startButton = screen.getByText('Start');
      fireEvent.click(startButton);

      // Complete a vision reminder
      act(() => {
        jest.advanceTimersByTime(20 * 60 * 1000);
      });

      await waitFor(() => {
        expect(screen.getByText('Reminders Shown: 1')).toBeInTheDocument();
      });

      // Complete another reminder
      fireEvent.click(screen.getByText('Start'));
      act(() => {
        jest.advanceTimersByTime(20 * 60 * 1000);
      });

      await waitFor(() => {
        expect(screen.getByText('Reminders Shown: 2')).toBeInTheDocument();
      });
    });
  });

  describe('State Persistence', () => {
    it('should persist timer state across page reloads', () => {
      // Set up initial state
      const pomodoroState = {
        seconds: 1200, // 20 minutes remaining
        isActive: true,
        mode: 'work',
        completedSessions: 3,
        totalWorkTime: 4500, // 75 minutes
        startTime: Date.now() - 300000, // 5 minutes ago
      };

      localStorage.setItem('pomodoroTimerState', JSON.stringify(pomodoroState));

      renderWithProviders(<PomodoroTimer />);

      expect(screen.getByText('20:00')).toBeInTheDocument();
      expect(screen.getByText('Pause')).toBeInTheDocument();
      expect(screen.getByText('Completed Sessions: 3')).toBeInTheDocument();
      expect(screen.getByText('Total Work Time: 1h 15m')).toBeInTheDocument();
    });

    it('should persist vision reminder state across page reloads', () => {
      // Set up initial state
      const visionState = {
        seconds: 600, // 10 minutes remaining
        isActive: true,
        remindersShown: 5,
        startTime: Date.now() - 600000, // 10 minutes ago
      };

      localStorage.setItem('visionReminderState', JSON.stringify(visionState));

      renderWithProviders(<VisionReminder />);

      expect(screen.getByText('10:00')).toBeInTheDocument();
      expect(screen.getByText('Pause')).toBeInTheDocument();
      expect(screen.getByText('Reminders Shown: 5')).toBeInTheDocument();
    });
  });

  describe('Notification System', () => {
    it('should show notifications for completed sessions', async () => {
      mockNotification.mockImplementation(() => ({
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      renderWithProviders(<PomodoroTimer />);

      const startButton = screen.getByText('Start');
      fireEvent.click(startButton);

      // Complete a work session
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

    it('should show notifications for vision reminders', async () => {
      mockNotification.mockImplementation(() => ({
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      renderWithProviders(<VisionReminder />);

      const startButton = screen.getByText('Start');
      fireEvent.click(startButton);

      // Complete a vision reminder
      act(() => {
        jest.advanceTimersByTime(20 * 60 * 1000);
      });

      await waitFor(() => {
        expect(mockNotification).toHaveBeenCalledWith(
          'Vision Reminder!',
          expect.objectContaining({
            body: 'Look at something 20 feet away for 20 seconds!',
            tag: 'vision-reminder',
          })
        );
      });
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive timer displays', () => {
      const { container: pomodoroContainer } = renderWithProviders(<PomodoroTimer />);
      const { container: visionContainer } = renderWithProviders(<VisionReminder />);

      // Check for responsive text classes
      expect(pomodoroContainer.querySelector('.text-4xl')).toBeInTheDocument();
      expect(pomodoroContainer.querySelector('.md\\:text-6xl')).toBeInTheDocument();
      expect(visionContainer.querySelector('.text-4xl')).toBeInTheDocument();
      expect(visionContainer.querySelector('.md\\:text-6xl')).toBeInTheDocument();
    });

    it('should have responsive button layouts', () => {
      const { container: pomodoroContainer } = renderWithProviders(<PomodoroTimer />);
      const { container: visionContainer } = renderWithProviders(<VisionReminder />);

      // Check for responsive grid classes
      expect(pomodoroContainer.querySelector('.grid')).toBeInTheDocument();
      expect(visionContainer.querySelector('.grid')).toBeInTheDocument();
    });
  });

  describe('Cursor Styles', () => {
    it('should have proper cursor styles for all interactive elements', () => {
      const { container: pomodoroContainer } = renderWithProviders(<PomodoroTimer />);
      const { container: visionContainer } = renderWithProviders(<VisionReminder />);

      // Check Pomodoro buttons
      const pomodoroButtons = pomodoroContainer.querySelectorAll('button');
      pomodoroButtons.forEach(button => {
        expect(button).toHaveStyle('cursor: pointer');
      });

      // Check Vision Reminder buttons
      const visionButtons = visionContainer.querySelectorAll('button');
      visionButtons.forEach(button => {
        expect(button).toHaveStyle('cursor: pointer');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      renderWithProviders(<PomodoroTimer />);

      const startButton = screen.getByText('Start');
      fireEvent.click(startButton);

      // Complete a work session
      act(() => {
        jest.advanceTimersByTime(25 * 60 * 1000);
      });

      // Should not crash and should still show completion
      await waitFor(() => {
        expect(screen.getByText('Completed Sessions: 1')).toBeInTheDocument();
      });
    });

    it('should handle server errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Server error' })
      });

      renderWithProviders(<PomodoroTimer />);

      const startButton = screen.getByText('Start');
      fireEvent.click(startButton);

      // Complete a work session
      act(() => {
        jest.advanceTimersByTime(25 * 60 * 1000);
      });

      // Should not crash and should still show completion
      await waitFor(() => {
        expect(screen.getByText('Completed Sessions: 1')).toBeInTheDocument();
      });
    });
  });
});
