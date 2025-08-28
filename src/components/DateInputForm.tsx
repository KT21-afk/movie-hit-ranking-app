'use client';

import { useState } from 'react';

interface DateInputFormProps {
  onSubmit: (year: number, month: number) => void;
  loading: boolean;
}

export default function DateInputForm({ onSubmit, loading }: DateInputFormProps) {
  const [year, setYear] = useState<string>('');
  const [month, setMonth] = useState<string>('');
  const [errors, setErrors] = useState<{ year?: string; month?: string }>({});

  const currentYear = new Date().getFullYear();
  const minYear = 1900;

  const validateForm = (): boolean => {
    const newErrors: { year?: string; month?: string } = {};

    // Year validation
    if (!year) {
      newErrors.year = '年を入力してください';
    } else {
      const yearNum = parseInt(year, 10);
      if (isNaN(yearNum) || yearNum < minYear || yearNum > currentYear) {
        newErrors.year = `${minYear}年から${currentYear}年の間で入力してください`;
      }
    }

    // Month validation
    if (!month) {
      newErrors.month = '月を入力してください';
    } else {
      const monthNum = parseInt(month, 10);
      if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        newErrors.month = '1から12の間で入力してください';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(parseInt(year, 10), parseInt(month, 10));
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setYear(value);
      if (errors.year) {
        setErrors(prev => ({ ...prev, year: undefined }));
      }
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setMonth(value);
    if (errors.month) {
      setErrors(prev => ({ ...prev, month: undefined }));
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sm:p-8 max-w-md mx-auto">

      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Year Input */}
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            年（西暦）
          </label>
          <input
            type="text"
            id="year"
            value={year}
            onChange={handleYearChange}
            placeholder={`例: ${currentYear - 25}`}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${
              errors.year ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
            maxLength={4}
          />
          {errors.year && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.year}</p>
          )}
        </div>

        {/* Month Select */}
        <div>
          <label htmlFor="month" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            月
          </label>
          <select
            id="month"
            value={month}
            onChange={handleMonthChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.month ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          >
            <option value="">月を選択してください</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((monthNum) => (
              <option key={monthNum} value={monthNum}>
                {monthNum}月
              </option>
            ))}
          </select>
          {errors.month && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.month}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-amber-300 disabled:to-amber-400 text-white font-medium py-2 px-4 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-md hover:shadow-lg"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              検索中...
            </div>
          ) : (
            '映画ランキングを見る'
          )}
        </button>
      </form>

    </div>
  );
}