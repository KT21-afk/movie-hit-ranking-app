// API request and response types

export interface BoxOfficeRequest {
  year: number;
  month: number;
}

// Error handling types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// HTTP error types
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR'
}

export interface ValidationError extends ApiError {
  code: ErrorCode.VALIDATION_ERROR;
  field?: string;
}

export interface NetworkError extends ApiError {
  code: ErrorCode.NETWORK_ERROR;
  statusCode?: number;
}