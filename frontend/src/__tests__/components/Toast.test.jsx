import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Toast from '../../components/Toast';

vi.mock('../../context/AppContext', () => ({
  useApp: vi.fn(),
}));

import { useApp } from '../../context/AppContext';

describe('Toast', () => {
  it('renders message and icon when visible', () => {
    useApp.mockReturnValue({ toast: { msg: 'Item saved!', icon: '✓', visible: true } });
    const { container } = render(<Toast />);
    expect(screen.getByText('Item saved!')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('show');
  });

  it('does not have show class when not visible', () => {
    useApp.mockReturnValue({ toast: { msg: '', icon: '✓', visible: false } });
    const { container } = render(<Toast />);
    expect(container.firstChild).not.toHaveClass('show');
  });

  it('renders with custom icon', () => {
    useApp.mockReturnValue({ toast: { msg: 'Added to favorites!', icon: '❤️', visible: true } });
    render(<Toast />);
    expect(screen.getByText('❤️')).toBeInTheDocument();
    expect(screen.getByText('Added to favorites!')).toBeInTheDocument();
  });
});
