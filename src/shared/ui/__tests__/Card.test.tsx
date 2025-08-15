import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card } from '../Card';

describe('Card', () => {
  it('should render children content', () => {
    render(<Card>Test content</Card>);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should have proper styling classes', () => {
    const { container } = render(<Card>Content</Card>);
    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement).toHaveClass('card', 'w-full');
  });

  it('should have responsive design', () => {
    const { container } = render(<Card>Content</Card>);
    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement).toHaveClass('w-full');
  });

  it('should handle title prop', () => {
    render(<Card title="Test Title">Content</Card>);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('should handle className prop', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement).toHaveClass('custom-class');
  });

  it('should handle complex content', () => {
    render(
      <Card>
        <div data-testid="complex-content">
          <h1>Title</h1>
          <p>Description</p>
          <button>Action</button>
        </div>
      </Card>
    );
    
    expect(screen.getByTestId('complex-content')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('should have proper semantic structure', () => {
    const { container } = render(<Card>Content</Card>);
    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement.tagName).toBe('SECTION');
  });
});
