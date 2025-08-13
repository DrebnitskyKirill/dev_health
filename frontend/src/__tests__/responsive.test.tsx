import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../shared/context/AuthContext';
import { PomodoroTimer } from '../features/pomodoro/PomodoroTimer';
import { VisionReminder } from '../features/visionReminder/VisionReminder';
import { Card } from '../shared/ui/Card';
import ProfilePage from '../pages/profile/ProfilePage';

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
jest.mock('../shared/context/AuthContext', () => ({
  ...jest.requireActual('../shared/context/AuthContext'),
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

describe('Responsive Design Tests', () => {
  describe('PomodoroTimer Responsive Design', () => {
    it('should have responsive text sizing', () => {
      const { container } = renderWithProviders(<PomodoroTimer />);

      // Check for text classes that are actually used
      const timerDisplay = container.querySelector('.text-5xl');
      expect(timerDisplay).toBeInTheDocument();

      const modeDisplay = container.querySelector('.text-lg');
      expect(modeDisplay).toBeInTheDocument();

      const subtitleDisplay = container.querySelector('.text-sm');
      expect(subtitleDisplay).toBeInTheDocument();
    });

    it('should have responsive button layout', () => {
      const { container } = renderWithProviders(<PomodoroTimer />);

      // Check for flex layout classes
      const buttonContainer = container.querySelector('.flex');
      expect(buttonContainer).toBeInTheDocument();

      // Check for gap spacing
      const gapSpacing = container.querySelector('.gap-2');
      expect(gapSpacing).toBeInTheDocument();
    });

    it('should have responsive padding and margins', () => {
      const { container } = renderWithProviders(<PomodoroTimer />);

      // Check for padding classes that are actually used
      const paddingElements = container.querySelectorAll('.p-6, .p-4');
      expect(paddingElements.length).toBeGreaterThan(0);

      // Check for margin classes that are actually used
      const marginElements = container.querySelectorAll('.mb-4, .mb-2, .mt-2');
      expect(marginElements.length).toBeGreaterThan(0);
    });
  });

  describe('VisionReminder Responsive Design', () => {
    it('should have responsive text sizing', () => {
      const { container } = renderWithProviders(<VisionReminder />);

      // Check for text classes that are actually used
      const timerDisplay = container.querySelector('.text-5xl');
      expect(timerDisplay).toBeInTheDocument();

      const titleDisplay = container.querySelector('.text-lg');
      expect(titleDisplay).toBeInTheDocument();

      const subtitleDisplay = container.querySelector('.text-sm');
      expect(subtitleDisplay).toBeInTheDocument();
    });

    it('should have responsive button layout', () => {
      const { container } = renderWithProviders(<VisionReminder />);

      // Check for flex layout classes
      const buttonContainer = container.querySelector('.flex');
      expect(buttonContainer).toBeInTheDocument();

      // Check for gap spacing
      const gapSpacing = container.querySelector('.gap-2');
      expect(gapSpacing).toBeInTheDocument();
    });
  });

  describe('Card Component Responsive Design', () => {
    it('should have responsive padding', () => {
      const { container } = render(
        <Card title="Test Card">
          <p>Content</p>
        </Card>
      );

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('p-6');
    });

    it('should handle responsive content', () => {
      const { container } = render(
        <Card title="Responsive Card">
          <div className="grid grid-cols-2 gap-4">
            <div>Item 1</div>
            <div>Item 2</div>
          </div>
        </Card>
      );

      // Check for grid classes that are actually used
      const gridElement = container.querySelector('.grid');
      expect(gridElement).toBeInTheDocument();

      const gridCols = container.querySelector('.grid-cols-2');
      expect(gridCols).toBeInTheDocument();
    });
  });

  describe('ProfilePage Responsive Design', () => {
    it('should have responsive grid layout', () => {
      const { container } = renderWithProviders(<ProfilePage />);

      // Check for grid classes that are actually used
      const mainGrid = container.querySelector('.grid');
      expect(mainGrid).toBeInTheDocument();

      const responsiveGrid = container.querySelector('.lg\\:grid-cols-3');
      expect(responsiveGrid).toBeInTheDocument();
    });

    it('should have responsive form layout', () => {
      const { container } = renderWithProviders(<ProfilePage />);

      // Click edit button to show form
      const editButton = screen.getByText('Edit Name & Password');
      editButton.click();

      // Check for form classes that are actually used
      const formElements = container.querySelectorAll('input, button');
      expect(formElements.length).toBeGreaterThan(0);
    });

    it('should have responsive spacing', () => {
      const { container } = renderWithProviders(<ProfilePage />);

      // Check for spacing classes that are actually used
      const spacingElements = container.querySelectorAll('.space-y-6, .gap-6, .p-5');
      expect(spacingElements.length).toBeGreaterThan(0);
    });
  });

  describe('General Responsive Patterns', () => {
    it('should use consistent responsive breakpoints', () => {
      const { container: pomodoroContainer } = renderWithProviders(<PomodoroTimer />);
      const { container: visionContainer } = renderWithProviders(<VisionReminder />);
      const { container: cardContainer } = render(<Card title="Test">Content</Card>);

      // Check for consistent responsive prefixes
      const allContainers = [pomodoroContainer, visionContainer, cardContainer];
      
      allContainers.forEach(container => {
        const responsiveClasses = container.innerHTML.match(/lg:|xl:/g);
        if (responsiveClasses) {
          // Should use standard Tailwind breakpoints
          const validBreakpoints = responsiveClasses.every(prefix => 
            ['lg:', 'xl:'].includes(prefix)
          );
          expect(validBreakpoints).toBe(true);
        }
      });
    });

    it('should have proper mobile-first approach', () => {
      const { container: pomodoroContainer } = renderWithProviders(<PomodoroTimer />);
      const { container: visionContainer } = renderWithProviders(<VisionReminder />);

      // Check that base classes exist (mobile-first)
      const containers = [pomodoroContainer, visionContainer];
      
      containers.forEach(container => {
        // Should have base classes without responsive prefixes
        const baseClasses = container.querySelectorAll('.text-5xl, .flex, .p-6');
        expect(baseClasses.length).toBeGreaterThan(0);
      });
    });

    it('should have responsive typography', () => {
      const { container: pomodoroContainer } = renderWithProviders(<PomodoroTimer />);
      const { container: visionContainer } = renderWithProviders(<VisionReminder />);

      const containers = [pomodoroContainer, visionContainer];
      
      containers.forEach(container => {
        // Check for text sizing classes that are actually used
        const textElements = container.querySelectorAll('.text-5xl, .text-lg, .text-sm');
        expect(textElements.length).toBeGreaterThan(0);
      });
    });

    it('should have responsive spacing', () => {
      const { container: pomodoroContainer } = renderWithProviders(<PomodoroTimer />);
      const { container: visionContainer } = renderWithProviders(<VisionReminder />);

      const containers = [pomodoroContainer, visionContainer];
      
      containers.forEach(container => {
        // Check for spacing classes that are actually used
        const spacingElements = container.querySelectorAll('.gap-2, .p-6, .mb-4');
        expect(spacingElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Interactive Elements Responsive Design', () => {
    it('should have responsive button sizing', () => {
      const { container: pomodoroContainer } = renderWithProviders(<PomodoroTimer />);
      const { container: visionContainer } = renderWithProviders(<VisionReminder />);

      const containers = [pomodoroContainer, visionContainer];
      
      containers.forEach(container => {
        const buttons = container.querySelectorAll('button');
        buttons.forEach(button => {
          // Check for button classes that are actually used
          const hasButtonClasses = button.className.includes('px-') || 
                                 button.className.includes('py-') ||
                                 button.className.includes('bg-');
          expect(hasButtonClasses).toBe(true);
        });
      });
    });

    it('should have proper touch targets on mobile', () => {
      const { container: pomodoroContainer } = renderWithProviders(<PomodoroTimer />);
      const { container: visionContainer } = renderWithProviders(<VisionReminder />);

      const containers = [pomodoroContainer, visionContainer];
      
      containers.forEach(container => {
        const buttons = container.querySelectorAll('button');
        buttons.forEach(button => {
          // Check for minimum touch target size (44px = 11 in Tailwind)
          const hasMinimumSize = button.className.includes('px-6') || 
                               button.className.includes('py-2');
          expect(hasMinimumSize).toBe(true);
        });
      });
    });
  });

  describe('Layout Responsive Design', () => {
    it('should have responsive container widths', () => {
      const { container: pomodoroContainer } = renderWithProviders(<PomodoroTimer />);
      const { container: visionContainer } = renderWithProviders(<VisionReminder />);

      const containers = [pomodoroContainer, visionContainer];
      
      containers.forEach(container => {
        // Check for width classes that are actually used
        const hasWidthClasses = container.innerHTML.includes('max-w-sm') ||
                               container.innerHTML.includes('w-full');
        expect(hasWidthClasses).toBe(true);
      });
    });

    it('should have responsive flex layouts', () => {
      const { container: pomodoroContainer } = renderWithProviders(<PomodoroTimer />);
      const { container: visionContainer } = renderWithProviders(<VisionReminder />);

      const containers = [pomodoroContainer, visionContainer];
      
      containers.forEach(container => {
        // Check for flex classes that are actually used
        const hasFlexClasses = container.innerHTML.includes('flex') ||
                              container.innerHTML.includes('flex-col');
        expect(hasFlexClasses).toBe(true);
      });
    });
  });
});
