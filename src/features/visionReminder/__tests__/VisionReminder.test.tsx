import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../shared/context/AuthContext';
import { LanguageProvider } from '../../../shared/context/LanguageContext';
import { VisionReminder } from '../VisionReminder';

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
      <LanguageProvider>
        <AuthProvider>
          {component}
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};

describe('VisionReminder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render reminder with initial state', () => {
    renderWithProviders(<VisionReminder />);

    expect(screen.getByText('20:00')).toBeInTheDocument();
    expect(screen.getByText('Vision Reminder')).toBeInTheDocument();
    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  it('should start reminder when start button is clicked', async () => {
    renderWithProviders(<VisionReminder />);

    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);

    expect(screen.getByText('Pause')).toBeInTheDocument();

    // Fast forward time
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByText('19:59')).toBeInTheDocument();
    });
  });

  it('should pause reminder when pause button is clicked', async () => {
    renderWithProviders(<VisionReminder />);

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
    const timeDisplay = screen.getByText('19:55');
    expect(timeDisplay).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Time should still be the same
    expect(screen.getByText('19:55')).toBeInTheDocument();
  });

  it('should reset reminder when reset button is clicked', () => {
    renderWithProviders(<VisionReminder />);

    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);

    // Fast forward time
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);

    expect(screen.getByText('20:00')).toBeInTheDocument();
    expect(screen.getByText('Start')).toBeInTheDocument();
  });

  it('should show notification when reminder time is up', async () => {
    mockNotification.mockImplementation(() => ({
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));

    renderWithProviders(<VisionReminder />);

    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);

    // Fast forward to end of reminder (20 minutes)
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

  it('should restart timer after reminder notification', async () => {
    renderWithProviders(<VisionReminder />);

    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);

    // Fast forward to end of reminder
    act(() => {
      jest.advanceTimersByTime(20 * 60 * 1000);
    });

    await waitFor(() => {
      expect(screen.getByText('20:00')).toBeInTheDocument();
      expect(screen.getByText('Start')).toBeInTheDocument();
    });
  });

  it('should persist reminder state in localStorage', () => {
    const savedState = {
      seconds: 1200, // 20 minutes
      isActive: true,
      remindersShown: 3,
      startTime: Date.now() - 60000, // 1 minute ago
    };

    localStorage.setItem('visionReminderState', JSON.stringify(savedState));

    renderWithProviders(<VisionReminder />);

    expect(screen.getByText('20:00')).toBeInTheDocument();
    expect(screen.getByText('Pause')).toBeInTheDocument();
  });

  it('should update localStorage when reminder state changes', () => {
    renderWithProviders(<VisionReminder />);

    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);

    const setItemSpy = jest.spyOn(localStorage.__proto__, 'setItem');
    expect(setItemSpy).toHaveBeenCalledWith(
      'visionReminderState',
      expect.stringContaining('"isActive":true')
    );
  });

  it('should display reminder statistics', () => {
    renderWithProviders(<VisionReminder />);

    expect(screen.getByText('Reminders Shown: 0')).toBeInTheDocument();
  });

  it('should update statistics after reminder completion', async () => {
    renderWithProviders(<VisionReminder />);

    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);

    // Complete a reminder
    act(() => {
      jest.advanceTimersByTime(20 * 60 * 1000);
    });

    await waitFor(() => {
      expect(screen.getByText('Reminders Shown: 1')).toBeInTheDocument();
    });
  });

  it('should handle multiple reminder cycles', async () => {
    renderWithProviders(<VisionReminder />);

    // Complete first reminder
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);

    act(() => {
      jest.advanceTimersByTime(20 * 60 * 1000);
    });

    await waitFor(() => {
      expect(screen.getByText('Reminders Shown: 1')).toBeInTheDocument();
    });

    // Start second reminder
    fireEvent.click(screen.getByText('Start'));

    act(() => {
      jest.advanceTimersByTime(20 * 60 * 1000);
    });

    await waitFor(() => {
      expect(screen.getByText('Reminders Shown: 2')).toBeInTheDocument();
    });
  });

  it('should have proper cursor styles for interactive elements', () => {
    renderWithProviders(<VisionReminder />);

    const startButton = screen.getByText('Start');
    const resetButton = screen.getByText('Reset');

    expect(startButton).toHaveStyle('cursor: pointer');
    expect(resetButton).toHaveStyle('cursor: pointer');
  });

  it('should be responsive on different screen sizes', () => {
    const { container } = renderWithProviders(<VisionReminder />);

    // Check for responsive classes
    expect(container.querySelector('.text-4xl')).toBeInTheDocument();
    expect(container.querySelector('.md\\:text-6xl')).toBeInTheDocument();
  });

  it('should display correct time format', () => {
    renderWithProviders(<VisionReminder />);

    // Test initial time
    expect(screen.getByText('20:00')).toBeInTheDocument();

    // Start timer and test time format
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);

    act(() => {
      jest.advanceTimersByTime(65 * 1000); // 1 minute 5 seconds
    });

    expect(screen.getByText('18:55')).toBeInTheDocument();
  });

  it('should handle edge case of 0 seconds remaining', async () => {
    renderWithProviders(<VisionReminder />);

    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);

    // Fast forward to exactly 20 minutes
    act(() => {
      jest.advanceTimersByTime(20 * 60 * 1000);
    });

    await waitFor(() => {
      expect(screen.getByText('20:00')).toBeInTheDocument();
    });
  });
});
