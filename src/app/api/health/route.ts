import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check environment variables
    const requiredEnvVars = ['TMDB_API_KEY', 'TMDB_BASE_URL'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

    if (missingEnvVars.length > 0) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Missing required environment variables',
          missing: missingEnvVars,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // Basic TMDb API connectivity check
    const tmdbHealthCheck = await fetch(
      `${process.env.TMDB_BASE_URL}/configuration?api_key=${process.env.TMDB_API_KEY}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      }
    );

    const tmdbStatus = tmdbHealthCheck.ok ? 'healthy' : 'unhealthy';

    return NextResponse.json(
      {
        status: 'healthy',
        services: {
          tmdb: {
            status: tmdbStatus,
            responseTime: tmdbHealthCheck.headers.get('x-response-time') || 'unknown',
          },
        },
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '0.1.0',
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}