import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login screen', () => {
  render(<App />);
  
  expect(screen.getByText(/secure healthcare/i)).toBeInTheDocument();
  expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
});
