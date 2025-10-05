/**
 * Performance monitoring utilities for production
 */

export interface PerformanceMetrics {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, string | number | boolean>;
}

interface WebVitalMetric {
  name: string;
  value: number;
  id: string;
  label: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];

  /**
   * Record a custom performance metric
   */
  recordMetric(name: string, duration: number, metadata?: Record<string, string | number | boolean>): void {
    const metric: PerformanceMetrics = {
      name,
      duration,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(metric);
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance: ${name} - ${duration.toFixed(2)}ms`, metadata);
    }
  }

  /**
   * Measure function execution time
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(name, duration, { error: true });
      throw error;
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Clear all recorded metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Send metrics to analytics service
   */
  private sendToAnalytics(metric: PerformanceMetrics): void {
    // Send to custom analytics endpoint
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
      fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metric),
      }).catch((error) => {
        console.warn('Failed to send analytics:', error);
      });
    }
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Hook for measuring React component render time
 */
export function usePerformanceMonitor(componentName: string) {
  const recordRender = () => {
    performanceMonitor.recordMetric(`${componentName}_render`, performance.now());
  };

  return { recordRender };
}

/**
 * Report Web Vitals to console in development
 */
export function reportWebVitals(metric: WebVitalMetric) {
  if (process.env.NODE_ENV === 'development') {
    console.log(metric);
  }

  // Record in performance monitor
  performanceMonitor.recordMetric(metric.name, metric.value, {
    id: metric.id,
    label: metric.label,
  });
}