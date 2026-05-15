import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditListingModal from '../../components/EditListingModal';

vi.mock('../../context/AppContext', () => ({
  useApp: vi.fn(),
}));
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const mockItem = {
  id: 'listing-1',
  title: 'Desk',
  category: 'Furniture',
  price: 80,
  condition: 'Good',
  status: 'Available',
  description: 'A nice desk',
  imageUrls: [
    { url: 'https://s3/a.jpg', key: 'listings/a.jpg' },
    { url: 'https://s3/b.jpg', key: 'listings/b.jpg' },
  ],
};

function setup(itemOverrides = {}, fetchResponse = { ok: true, json: async () => ({ id: 'listing-1' }) }) {
  const updateListing = vi.fn();
  const showToast = vi.fn();
  useApp.mockReturnValue({ updateListing, showToast });
  useAuth.mockReturnValue({ token: 'test-token' });
  global.fetch = vi.fn().mockResolvedValue(fetchResponse);
  const onClose = vi.fn();
  render(<EditListingModal item={{ ...mockItem, ...itemOverrides }} onClose={onClose} />);
  return { updateListing, showToast, onClose };
}

describe('EditListingModal — image management', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders existing photos', () => {
    setup();
    // All photo <img> elements have alt="" — use getAllByAltText
    const imgs = screen.getAllByAltText('');
    expect(imgs[0]).toHaveAttribute('src', 'https://s3/a.jpg');
    expect(imgs[1]).toHaveAttribute('src', 'https://s3/b.jpg');
  });

  it('shows a remove button for each existing photo', () => {
    setup();
    const removeButtons = screen.getAllByText('×');
    expect(removeButtons).toHaveLength(2);
  });

  it('hides a photo when its remove button is clicked', () => {
    setup();
    fireEvent.click(screen.getAllByText('×')[0]);
    const imgs = screen.getAllByAltText('');
    expect(imgs).toHaveLength(1);
    expect(imgs[0]).toHaveAttribute('src', 'https://s3/b.jpg');
  });

  it('shows the + add button when under 5 images', () => {
    setup();
    expect(screen.getByText('+')).toBeInTheDocument();
  });

  it('hides the + add button when at 5 images', () => {
    const fiveImages = Array.from({ length: 5 }, (_, i) => ({
      url: `https://s3/${i}.jpg`,
      key: `listings/${i}.jpg`,
    }));
    setup({ imageUrls: fiveImages });
    expect(screen.queryByText('+')).not.toBeInTheDocument();
  });

  it('shows the + button again after removing a photo when at limit', () => {
    const fiveImages = Array.from({ length: 5 }, (_, i) => ({
      url: `https://s3/${i}.jpg`,
      key: `listings/${i}.jpg`,
    }));
    setup({ imageUrls: fiveImages });
    expect(screen.queryByText('+')).not.toBeInTheDocument();
    fireEvent.click(screen.getAllByText('×')[0]);
    expect(screen.getByText('+')).toBeInTheDocument();
  });

  it('shows current image count label', () => {
    setup();
    expect(screen.getByText('2 / 5')).toBeInTheDocument();
  });

  it('updates count label after removing a photo', () => {
    setup();
    fireEvent.click(screen.getAllByText('×')[0]);
    expect(screen.getByText('1 / 5')).toBeInTheDocument();
  });
});

describe('EditListingModal — form fields', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('pre-fills all fields from the item prop', () => {
    setup();
    expect(screen.getByDisplayValue('Desk')).toBeInTheDocument();
    expect(screen.getByDisplayValue('80')).toBeInTheDocument();
    expect(screen.getByDisplayValue('A nice desk')).toBeInTheDocument();
  });

  it('shows title and price required toast when fields are empty', () => {
    const { showToast } = setup();
    fireEvent.change(screen.getByDisplayValue('Desk'), { target: { value: '' } });
    fireEvent.click(screen.getByText('Save changes'));
    expect(showToast).toHaveBeenCalledWith('Title and price are required', '⚠️');
  });

  it('shows buyer email field when Sold status is selected', () => {
    setup();
    fireEvent.click(screen.getByText('Sold'));
    expect(screen.getByPlaceholderText('buyer@umass.edu')).toBeInTheDocument();
  });

  it('shows buyer email required toast when Sold selected without email', () => {
    const { showToast } = setup();
    fireEvent.click(screen.getByText('Sold'));
    fireEvent.click(screen.getByText('Notify buyer'));
    expect(showToast).toHaveBeenCalledWith("Enter the buyer's ReLoop email to mark as Sold", '⚠️');
  });
});

describe('EditListingModal — save behaviour', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('sends a PATCH request with FormData on save', async () => {
    const { onClose } = setup();
    fireEvent.click(screen.getByText('Save changes'));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/listings/listing-1'),
        expect.objectContaining({ method: 'PATCH' })
      );
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('sends removeImageKeys in FormData when a photo is removed', async () => {
    setup();
    fireEvent.click(screen.getAllByText('×')[0]);
    fireEvent.click(screen.getByText('Save changes'));
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const [, options] = global.fetch.mock.calls[0];
    expect(options.body).toBeInstanceOf(FormData);
    expect(options.body.get('removeImageKeys')).toBe(JSON.stringify(['listings/a.jpg']));
  });

  it('calls updateListing with server response on success', async () => {
    const { updateListing } = setup();
    fireEvent.click(screen.getByText('Save changes'));
    await waitFor(() => expect(updateListing).toHaveBeenCalledWith('listing-1', { id: 'listing-1' }));
  });

  it('shows error toast when server returns non-ok response', async () => {
    const { showToast } = setup({}, {
      ok: false,
      json: async () => ({ message: 'Server error' }),
    });
    fireEvent.click(screen.getByText('Save changes'));
    await waitFor(() => expect(showToast).toHaveBeenCalledWith('Server error', '⚠️'));
  });

  it('shows error toast on network failure', async () => {
    const { showToast } = setup();
    global.fetch = vi.fn().mockRejectedValue(new Error('network error'));
    fireEvent.click(screen.getByText('Save changes'));
    await waitFor(() => expect(showToast).toHaveBeenCalledWith('Could not update listing', '⚠️'));
  });

  it('closes modal when close button is clicked', () => {
    const { onClose } = setup();
    fireEvent.click(document.querySelector('.btn-close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('closes modal when backdrop is clicked', () => {
    const { onClose } = setup();
    // The outermost modal div is the backdrop
    fireEvent.click(document.querySelector('.modal'));
    expect(onClose).toHaveBeenCalled();
  });
});

describe('EditListingModal — condition and status pills', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders all four condition pills', () => {
    setup();
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('Like New')).toBeInTheDocument();
    expect(screen.getByText('Good')).toBeInTheDocument();
    expect(screen.getByText('Fair')).toBeInTheDocument();
  });

  it('renders all three status pills', () => {
    setup();
    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('In-talk')).toBeInTheDocument();
    expect(screen.getByText('Sold')).toBeInTheDocument();
  });

  it('pre-selects the correct condition from item prop', () => {
    setup();
    // Good is the item's condition — it should have the "on" class
    expect(screen.getByText('Good').className).toContain('on');
  });

  it('hides buyer email field when status is Available', () => {
    setup();
    expect(screen.queryByPlaceholderText('buyer@umass.edu')).not.toBeInTheDocument();
  });

  it('hides buyer email field when status switches back from Sold', () => {
    setup();
    fireEvent.click(screen.getByText('Sold'));
    expect(screen.getByPlaceholderText('buyer@umass.edu')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Available'));
    expect(screen.queryByPlaceholderText('buyer@umass.edu')).not.toBeInTheDocument();
  });

  it('renders the modal title', () => {
    setup();
    expect(screen.getByText('Edit listing')).toBeInTheDocument();
  });
});