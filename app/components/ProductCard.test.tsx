import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from './ProductCard';
import { useCart } from '../context/CartContext';

jest.mock('../context/CartContext', () => ({
  useCart: jest.fn(),
}));

describe('ProductCard Component', () => {
  const mockProduct = {
    id: '1',
    title: 'Test Laptop',
    description: 'A powerful test laptop',
    price: 999.99,
    imageUrl: 'https://test.com/laptop.jpg',
    stripePriceId: 'price_12345',
  };

  const mockAddToCart = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useCart as jest.Mock).mockReturnValue({ addToCart: mockAddToCart });
    window.alert = jest.fn();
  });

  it('renders correctly and matches snapshot', () => {
    const { container } = render(<ProductCard product={mockProduct} />);
    expect(container).toMatchSnapshot();
  });

  it('displays the correct product information', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Test Laptop')).toBeInTheDocument();
    expect(screen.getByText('A powerful test laptop')).toBeInTheDocument();
    expect(screen.getByText('$999.99')).toBeInTheDocument();
  });

  it('calls addToCart and alerts when Add to Cart button is clicked', () => {
    render(<ProductCard product={mockProduct} />);
    
    const button = screen.getByText('Add to Cart');
    fireEvent.click(button);

    expect(mockAddToCart).toHaveBeenCalledWith({
      id: '1',
      title: 'Test Laptop',
      price: 999.99,
      imageUrl: 'https://test.com/laptop.jpg',
      stripePriceId: 'price_12345',
    });
    
    expect(window.alert).toHaveBeenCalledWith('Test Laptop added to cart! 🛒');
  });

  it('alerts error if stripePriceId is missing', () => {
    const productWithoutStripe = { ...mockProduct, stripePriceId: null };
    render(<ProductCard product={productWithoutStripe} />);
    
    const button = screen.getByText('Add to Cart');
    fireEvent.click(button);

    expect(mockAddToCart).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('This product is not registered in Stripe and cannot be added to the cart.');
  });
});