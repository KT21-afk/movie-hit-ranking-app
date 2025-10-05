import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DateInputForm from '../DateInputForm';

describe('DateInputForm', () => {
  const mockOnSubmit = jest.fn();
  const currentYear = new Date().getFullYear();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('フォーム要素が正しく表示される', () => {
    render(<DateInputForm onSubmit={mockOnSubmit} loading={false} />);

    expect(screen.getByLabelText('年（西暦）')).toBeInTheDocument();
    expect(screen.getByLabelText('月')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '映画ランキングを見る' })).toBeInTheDocument();
  });

  it('年入力フィールドにプレースホルダーテキストが表示される', () => {
    render(<DateInputForm onSubmit={mockOnSubmit} loading={false} />);

    const yearInput = screen.getByLabelText('年（西暦）');
    expect(yearInput).toHaveAttribute('placeholder', `例: ${currentYear - 25}`);
  });

  it('月の選択肢が正しく表示される', () => {
    render(<DateInputForm onSubmit={mockOnSubmit} loading={false} />);

    const monthSelect = screen.getByLabelText('月');
    expect(monthSelect).toBeInTheDocument();

    // Check that all 12 months are available
    for (let i = 1; i <= 12; i++) {
      expect(screen.getByRole('option', { name: `${i}月` })).toBeInTheDocument();
    }
  });

  describe('フォームバリデーション', () => {
    it('年が空でフォームが送信された時にエラーが表示される', async () => {
      const user = userEvent.setup();
      render(<DateInputForm onSubmit={mockOnSubmit} loading={false} />);

      const submitButton = screen.getByRole('button', { name: '映画ランキングを見る' });
      await user.click(submitButton);

      expect(screen.getByText('年を入力してください')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('月が空でフォームが送信された時にエラーが表示される', async () => {
      const user = userEvent.setup();
      render(<DateInputForm onSubmit={mockOnSubmit} loading={false} />);

      const yearInput = screen.getByLabelText('年（西暦）');
      await user.type(yearInput, '2000');

      const submitButton = screen.getByRole('button', { name: '映画ランキングを見る' });
      await user.click(submitButton);

      expect(screen.getByText('月を入力してください')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('年が最小値（1900）を下回る時にエラーが表示される', async () => {
      const user = userEvent.setup();
      render(<DateInputForm onSubmit={mockOnSubmit} loading={false} />);

      const yearInput = screen.getByLabelText('年（西暦）');
      await user.type(yearInput, '1899');

      const submitButton = screen.getByRole('button', { name: '映画ランキングを見る' });
      await user.click(submitButton);

      expect(screen.getByText(`1900年から${currentYear}年の間で入力してください`)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('年が現在年を上回る時にエラーが表示される', async () => {
      const user = userEvent.setup();
      render(<DateInputForm onSubmit={mockOnSubmit} loading={false} />);

      const yearInput = screen.getByLabelText('年（西暦）');
      await user.type(yearInput, String(currentYear + 1));

      const submitButton = screen.getByRole('button', { name: '映画ランキングを見る' });
      await user.click(submitButton);

      expect(screen.getByText(`1900年から${currentYear}年の間で入力してください`)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('年入力フィールドで数値のみ入力可能である', async () => {
      const user = userEvent.setup();
      render(<DateInputForm onSubmit={mockOnSubmit} loading={false} />);

      const yearInput = screen.getByLabelText('年（西暦）');
      await user.type(yearInput, 'abc123def');

      // Should only contain the numeric characters
      expect(yearInput).toHaveValue('123');
    });

    it('年入力フィールドが4文字に制限される', async () => {
      const user = userEvent.setup();
      render(<DateInputForm onSubmit={mockOnSubmit} loading={false} />);

      const yearInput = screen.getByLabelText('年（西暦）');
      await user.type(yearInput, '12345');

      // Should be limited to 4 characters
      expect(yearInput).toHaveValue('1234');
    });
  });

  describe('フォーム送信', () => {
    it('フォームが有効な時に正しい値でonSubmitが呼ばれる', async () => {
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

    it('ローディング中はフォーム送信が防止される', async () => {
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

  describe('エラークリア', () => {
    it('ユーザーが有効な入力を開始した時に年のエラーがクリアされる', async () => {
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

    it('ユーザーが月を選択した時に月のエラーがクリアされる', async () => {
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

  describe('ローディング状態', () => {
    it('ローディング中にスピナーとテキストが表示される', () => {
      render(<DateInputForm onSubmit={mockOnSubmit} loading={true} />);

      const submitButton = screen.getByRole('button');
      expect(submitButton).toHaveTextContent('検索中...');
      expect(submitButton).toBeDisabled();
    });

    it('ローディング中にフォーム入力が無効化される', () => {
      render(<DateInputForm onSubmit={mockOnSubmit} loading={true} />);

      const yearInput = screen.getByLabelText('年（西暦）');
      const monthSelect = screen.getByLabelText('月');

      expect(yearInput).toBeDisabled();
      expect(monthSelect).toBeDisabled();
    });
  });
});