import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DateInputForm from '../DateInputForm';

describe('DateInputForm', () => {
  const mockOnSubmit = jest.fn();
  const currentYear = new Date().getFullYear();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders form elements correctly', () => {
    render(<DateInputForm onSubmit={mockOnSubmit} loading={false} />);

    expect(screen.getByLabelText('年（西暦）')).toBeInTheDocument();
    expect(screen.getByLabelText('月')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '映画ランキングを見る' })).toBeInTheDocument();
  });

  it('shows placeholder text for year input', () => {
    render(<DateInputForm onSubmit={mockOnSubmit} loading={false} />);

    const yearInput = screen.getByLabelText('年（西暦）');
    expect(yearInput).toHaveAttribute('placeholder', `例: ${currentYear - 25}`);
  });

  it('renders month options correctly', () => {
    render(<DateInputForm onSubmit={mockOnSubmit} loading={false} />);

    const monthSelect = screen.getByLabelText('月');
    expect(monthSelect).toBeInTheDocument();

    // Check that all 12 months are available
    for (let i = 1; i <= 12; i++) {
      expect(screen.getByRole('option', { name: `${i}月` })).toBeInTheDocument();
    }
  });

  describe('Form Validation', () => {
    it('shows error when year is empty and form is submitted', async () => {
      const user = userEvent.setup();
      render(<DateInputForm onSubmit={mockOnSubmit} loading={false} />);

      const submitButton = screen.getByRole('button', { name: '映画ランキングを見る' });
      await user.click(submitButton);

      expect(screen.getByText('年を入力してください')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('shows error when month is empty and form is submitted', async () => {
      const user = userEvent.setup();
      render(<DateInputForm onSubmit={mockOnSubmit} loading={false} />);

      const yearInput = screen.getByLabelText('年（西暦）');
      await user.type(yearInput, '2000');

      const submitButton = screen.getByRole('button', { name: '映画ランキングを見る' });
      await user.click(submitButton);

      expect(screen.getByText('月を入力してください')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('shows error when year is below minimum (1900)', async () => {
      const user = userEvent.setup();
      render(<DateInputForm onSubmit={mockOnSubmit} loading={false} />);

      const yearInput = screen.getByLabelText('年（西暦）');
      await user.type(yearInput, '1899');

      const submitButton = screen.getByRole('button', { name: '映画ランキングを見る' });
      await user.click(submitButton);

      expect(screen.getByText(`1900年から${currentYear}年の間で入力してください`)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('shows error when year is above current year', async () => {
      const user = userEvent.setup();
      render(<DateInputForm onSubmit={mockOnSubmit} loading={false} />);

      const yearInput = screen.getByLabelText('年（西暦）');
      await user.type(yearInput, String(currentYear + 1));

      const submitButton = screen.getByRole('button', { name: '映画ランキングを見る' });
      await user.click(submitButton);

      expect(screen.getByText(`1900年から${currentYear}年の間で入力してください`)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('only allows numeric input for year', async () => {
      const user = userEvent.setup();
      render(<DateInputForm onSubmit={mockOnSubmit} loading={false} />);

      const yearInput = screen.getByLabelText('年（西暦）');
      await user.type(yearInput, 'abc123def');

      // Should only contain the numeric characters
      expect(yearInput).toHaveValue('123');
    });

    it('limits year input to 4 characters', async () => {
      const user = userEvent.setup();
      render(<DateInputForm onSubmit={mockOnSubmit} loading={false} />);

      const yearInput = screen.getByLabelText('年（西暦）');
      await user.type(yearInput, '12345');

      // Should be limited to 4 characters
      expect(yearInput).toHaveValue('1234');
    });
  });

  describe('Form Submission', () => {
    it('calls onSubmit with correct values when form is valid', async () => {
      const user = userEvent.setup();
      render(<DateInputForm onSubmit={mockOnSubmit} loading={false} />);

      const yearInput = screen.getByLabelText('年（西暦）');
      const monthSelect = screen.getByLabelText('月');

      await user.type(yearInput, '2000');
      await user.selectOptions(monthSelect, '5');

      const submitButton = screen.getByRole('button', { name: '映画ランキングを見る' });
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith(2000, 5);
    });

    it('prevents form submission when loading', async () => {
      const user = userEvent.setup();
      render(<DateInputForm onSubmit={mockOnSubmit} loading={true} />);

      const yearInput = screen.getByLabelText('年（西暦）');
      const monthSelect = screen.getByLabelText('月');

      expect(yearInput).toBeDisabled();
      expect(monthSelect).toBeDisabled();

      const submitButton = screen.getByRole('button');
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent('検索中...');
    });
  });

  describe('Error Clearing', () => {
    it('clears year error when user starts typing valid input', async () => {
      const user = userEvent.setup();
      render(<DateInputForm onSubmit={mockOnSubmit} loading={false} />);

      // First trigger an error
      const submitButton = screen.getByRole('button', { name: '映画ランキングを見る' });
      await user.click(submitButton);

      expect(screen.getByText('年を入力してください')).toBeInTheDocument();

      // Then start typing
      const yearInput = screen.getByLabelText('年（西暦）');
      await user.type(yearInput, '2000');

      // Error should be cleared
      expect(screen.queryByText('年を入力してください')).not.toBeInTheDocument();
    });

    it('clears month error when user selects a month', async () => {
      const user = userEvent.setup();
      render(<DateInputForm onSubmit={mockOnSubmit} loading={false} />);

      // First trigger an error
      const yearInput = screen.getByLabelText('年（西暦）');
      await user.type(yearInput, '2000');

      const submitButton = screen.getByRole('button', { name: '映画ランキングを見る' });
      await user.click(submitButton);

      expect(screen.getByText('月を入力してください')).toBeInTheDocument();

      // Then select a month
      const monthSelect = screen.getByLabelText('月');
      await user.selectOptions(monthSelect, '5');

      // Error should be cleared
      expect(screen.queryByText('月を入力してください')).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner and text when loading', () => {
      render(<DateInputForm onSubmit={mockOnSubmit} loading={true} />);

      const submitButton = screen.getByRole('button');
      expect(submitButton).toHaveTextContent('検索中...');
      expect(submitButton).toBeDisabled();
    });

    it('disables form inputs when loading', () => {
      render(<DateInputForm onSubmit={mockOnSubmit} loading={true} />);

      const yearInput = screen.getByLabelText('年（西暦）');
      const monthSelect = screen.getByLabelText('月');

      expect(yearInput).toBeDisabled();
      expect(monthSelect).toBeDisabled();
    });
  });
});