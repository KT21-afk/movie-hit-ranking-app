'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Currency } from '@/types/currency';

interface CurrencyContextType {
  currency: Currency;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
}

/**
 * ブラウザーの最優先言語から初期通貨を決定する
 * @returns 最優先言語が日本語の場合はJPY、それ以外はUSD
 */
const getInitialCurrency = (): Currency => {
  if (typeof window === 'undefined') {
    return 'JPY'; // SSR時のデフォルト
  }

  // ブラウザーの最優先言語を取得
  const primaryLanguage = navigator.languages?.[0] || navigator.language || 'en';

  // 最優先言語が日本語かチェック
  const isJapanese = primaryLanguage.toLowerCase().startsWith('ja');

  return isJapanese ? 'JPY' : 'USD';
};

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const [currency, setCurrency] = useState<Currency>('JPY'); // 初期値（SSR対応）
  const [isInitialized, setIsInitialized] = useState(false);

  // クライアントサイドでブラウザーの言語設定に基づいて通貨を設定
  useEffect(() => {
    if (!isInitialized) {
      const initialCurrency = getInitialCurrency();

      // 開発環境でのデバッグ情報
      if (process.env.NODE_ENV === 'development') {
        const primaryLanguage = navigator.languages?.[0] || navigator.language || 'en';
        console.log('Primary language:', primaryLanguage);
        console.log('Initial currency set to:', initialCurrency);
      }

      setCurrency(initialCurrency);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  return (
    <CurrencyContext.Provider value={{ currency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}