/**
 * 日付文字列をフォーマットする（Hydrationエラーを防ぐため、そのまま返す）
 * @param dateString YYYY-MM-DD形式の日付文字列
 * @returns フォーマットされた日付文字列
 */
export const formatDate = (dateString: string): string => {
  return dateString; // そのまま返す（YYYY-MM-DD形式）
};

/**
 * 数値をカンマ区切りでフォーマットする
 * @param amount 数値
 * @returns カンマ区切りでフォーマットされた文字列
 */
export const formatNumber = (amount: number): string => {
  // ロケールに依存しない一貫したフォーマット
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * 興行収入をドルでフォーマットする
 * @param amount 興行収入の数値（ドル）
 * @returns ドル表記でフォーマットされた文字列
 */
export const formatBoxOfficeUSD = (amount: number): string => {
  return `$${formatNumber(amount)}`;
};

/**
 * 興行収入を円でフォーマットする（1ドル = 150円で換算）
 * @param amountUSD 興行収入の数値（ドル）
 * @param exchangeRate 為替レート（デフォルト: 150円/ドル）
 * @returns 円表記でフォーマットされた文字列
 */
export const formatBoxOfficeJPY = (amountUSD: number, exchangeRate: number = 150): string => {
  const amountJPY = Math.round(amountUSD * exchangeRate);
  return `¥${formatNumber(amountJPY)}`;
};

/**
 * 興行収入をドルと円の両方でフォーマットする
 * @param amountUSD 興行収入の数値（ドル）
 * @param exchangeRate 為替レート（デフォルト: 150円/ドル）
 * @returns ドルと円の両方を含む文字列
 */
export const formatBoxOfficeBoth = (amountUSD: number, exchangeRate: number = 150): string => {
  const usdFormatted = formatBoxOfficeUSD(amountUSD);
  const jpyFormatted = formatBoxOfficeJPY(amountUSD, exchangeRate);
  return `${usdFormatted} (${jpyFormatted})`;
};

import { Currency } from '@/types/currency';

/**
 * 通貨設定に基づいて興行収入をフォーマットする
 * @param amountUSD 興行収入の数値（ドル）
 * @param currency 表示通貨（'JPY' | 'USD'）
 * @param exchangeRate 為替レート（デフォルト: 150円/ドル）
 * @returns 指定された通貨でフォーマットされた文字列
 */
export const formatBoxOfficeByCurrency = (
  amountUSD: number,
  currency: Currency,
  exchangeRate: number = 150
): string => {
  return currency === 'JPY'
    ? formatBoxOfficeJPY(amountUSD, exchangeRate)
    : formatBoxOfficeUSD(amountUSD);
};

/**
 * 後方互換性のための関数（既存のformatBoxOffice）
 * @param amount 興行収入の数値
 * @returns カンマ区切りでフォーマットされた文字列
 */
export const formatBoxOffice = (amount: number): string => {
  return formatNumber(amount);
};