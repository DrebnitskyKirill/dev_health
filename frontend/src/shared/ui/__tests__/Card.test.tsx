import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card } from '../Card';

describe('Card', () => {
  it('should render card with title and children', () => {
    render(
      <Card title="Test Card">
        <p>Card content</p>
      </Card>
    );

    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('should render card without title', () => {
    render(
      <Card>
        <p>Card content without title</p>
      </Card>
    );

    expect(screen.getByText('Card content without title')).toBeInTheDocument();
  });

  it('should have proper styling classes', () => {
    const { container } = render(
      <Card title="Test Card">
        <p>Content</p>
      </Card>
    );

    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement).toHaveClass('bg-white', 'rounded-lg', 'shadow-md', 'p-6');
  });

  it('should have responsive design', () => {
    const { container } = render(
      <Card title="Test Card">
        <p>Content</p>
      </Card>
    );

    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement).toHaveClass('p-6');
  });

  it('should handle complex content', () => {
    render(
      <Card title="Complex Card">
        <div>
          <h3>Subtitle</h3>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
          <button>Action Button</button>
        </div>
      </Card>
    );

    expect(screen.getByText('Complex Card')).toBeInTheDocument();
    expect(screen.getByText('Subtitle')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Action Button')).toBeInTheDocument();
  });

  it('should handle empty content', () => {
    render(<Card title="Empty Card" />);

    expect(screen.getByText('Empty Card')).toBeInTheDocument();
  });

  it('should have proper semantic structure', () => {
    const { container } = render(
      <Card title="Semantic Card">
        <p>Content</p>
      </Card>
    );

    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement.tagName).toBe('DIV');
  });
});
