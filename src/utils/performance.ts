// Performance monitoring and optimization utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMeasure(name: string): void {
    performance.mark(`${name}-start`);
  }

  endMeasure(name: string): number {
    // Check if start mark exists before attempting to measure
    const startMarkName = `${name}-start`;
    const startMarks = performance.getEntriesByName(startMarkName, 'mark');
    
    if (startMarks.length === 0) {
      console.warn(`Performance mark '${startMarkName}' does not exist. Skipping measurement for '${name}'.`);
      return 0;
    }
    
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = performance.getEntriesByName(name, 'measure')[0];
    const duration = measure.duration;
    
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const measurements = this.metrics.get(name)!;
    measurements.push(duration);
    
    // Keep only last 100 measurements
    if (measurements.length > 100) {
      measurements.shift();
    }
    
    // Clean up performance entries
    performance.clearMarks(`${name}-start`);
    performance.clearMarks(`${name}-end`);
    performance.clearMeasures(name);
    
    return duration;
  }

  getAverageTime(name: string): number {
    const measurements = this.metrics.get(name);
    if (!measurements || measurements.length === 0) return 0;
    
    return measurements.reduce((sum, time) => sum + time, 0) / measurements.length;
  }

  getMetrics(): Record<string, { average: number; count: number; latest: number }> {
    const result: Record<string, { average: number; count: number; latest: number }> = {};
    
    this.metrics.forEach((measurements, name) => {
      result[name] = {
        average: this.getAverageTime(name),
        count: measurements.length,
        latest: measurements[measurements.length - 1] || 0
      };
    });
    
    return result;
  }

  logPerformanceReport(): void {
    const metrics = this.getMetrics();
    console.group('🚀 ORMEN Performance Report');
    
    Object.entries(metrics).forEach(([name, data]) => {
      console.log(`${name}: ${data.latest.toFixed(2)}ms (avg: ${data.average.toFixed(2)}ms, samples: ${data.count})`);
    });
    
    console.groupEnd();
  }
}

// React performance hooks
export const usePerformanceMonitor = (name: string) => {
  const monitor = PerformanceMonitor.getInstance();
  
  return {
    start: () => monitor.startMeasure(name),
    end: () => monitor.endMeasure(name),
    getAverage: () => monitor.getAverageTime(name)
  };
};

// Memory usage monitoring
export const getMemoryUsage = (): any => {
  if ('memory' in performance) {
    return {
      used: (performance as any).memory.usedJSHeapSize,
      total: (performance as any).memory.totalJSHeapSize,
      limit: (performance as any).memory.jsHeapSizeLimit
    };
  }
  return null;
};

// Network monitoring
export const getNetworkInfo = (): any => {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    };
  }
  return null;
};

// Bundle size analyzer
export const analyzeBundleSize = () => {
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  
  console.group('📦 Bundle Analysis');
  console.log('Scripts:', scripts.length);
  console.log('Stylesheets:', styles.length);
  console.groupEnd();
};