import { NextRequest, NextResponse } from 'next/server';
import { tmdbService } from '@/services/tmdb';
import { ApiResponse, BoxOfficeResponse, ErrorCode } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // URLパラメータを取得
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');
    const monthParam = searchParams.get('month');

    // パラメータのバリデーション
    if (!yearParam || !monthParam) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Year and month parameters are required'
        }
      };
      return NextResponse.json(response, { status: 400 });
    }

    const year = parseInt(yearParam, 10);
    const month = parseInt(monthParam, 10);

    // 数値バリデーション
    if (isNaN(year) || isNaN(month)) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Year and month must be valid numbers'
        }
      };
      return NextResponse.json(response, { status: 400 });
    }

    // 範囲バリデーション
    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: `Year must be between 1900 and ${currentYear}`
        }
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (month < 1 || month > 12) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Month must be between 1 and 12'
        }
      };
      return NextResponse.json(response, { status: 400 });
    }

    // TMDb APIから映画データを取得
    const movies = await tmdbService.getMoviesByDate(year, month);

    // レスポンスデータを整形
    const boxOfficeResponse: BoxOfficeResponse = {
      movies,
      year,
      month
    };

    const response: ApiResponse<BoxOfficeResponse> = {
      success: true,
      data: boxOfficeResponse
    };

    return NextResponse.json(response, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });

  } catch (error) {
    console.error('Box office API error:', error);

    // エラーの種類に応じてレスポンスを作成
    let statusCode = 500;
    let errorResponse: ApiResponse<null>;

    if (error && typeof error === 'object' && 'code' in error) {
      const apiError = error as any;
      
      switch (apiError.code) {
        case ErrorCode.VALIDATION_ERROR:
          statusCode = 400;
          break;
        case ErrorCode.NOT_FOUND:
          statusCode = 404;
          break;
        case ErrorCode.RATE_LIMIT_ERROR:
          statusCode = 429;
          break;
        case ErrorCode.TIMEOUT_ERROR:
        case ErrorCode.NETWORK_ERROR:
          statusCode = 503;
          break;
        case ErrorCode.EXTERNAL_API_ERROR:
          statusCode = 502;
          break;
        default:
          statusCode = 500;
      }

      errorResponse = {
        success: false,
        error: apiError
      };
    } else {
      errorResponse = {
        success: false,
        error: {
          code: ErrorCode.SERVER_ERROR,
          message: 'An unexpected error occurred'
        }
      };
    }

    return NextResponse.json(errorResponse, { status: statusCode });
  }
}