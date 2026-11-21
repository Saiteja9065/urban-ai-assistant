import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from '@/app/page';

describe('Urban Air Quality Assistant Landing Page', () => {
  it('renders the main heading and milestone 1 status', () => {
    render(<Home />);
    expect(screen.getByText(/Urban Air Quality Assistant/i)).toBeInTheDocument();
    expect(screen.getByText(/Milestone 1 Online/i)).toBeInTheDocument();
  });
});
