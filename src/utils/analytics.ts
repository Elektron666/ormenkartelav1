// Analytics and usage tracking for ORMEN application
interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
  sessionId: string;
  userId: string;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private userId: string = 'ORMEN_USER';
  private isEnabled: boolean = true;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadStoredEvents();
    this.setupAutoFlush();
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadStoredEvents(): void {
    try {
      const stored = localStorage.getItem('ormen_analytics_events');
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load stored analytics events:', error);
    }
  }

  private saveEvents(): void {
    try {
      localStorage.setItem('ormen_analytics_events', JSON.stringify(this.events));
    } catch (error) {
      console.error('Failed to save analytics events:', error);
    }
  }

  private setupAutoFlush(): void {
    // Auto-flush events every 5 minutes
    setInterval(() => {
      this.flushEvents();
    }, 5 * 60 * 1000);

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flushEvents();
    });
  }

  // Track custom events
  track(event: string, category: string, action: string, label?: string, value?: number): void {
    if (!this.isEnabled) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      category,
      action,
      label,
      value,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId
    };

    this.events.push(analyticsEvent);
    this.saveEvents();

    // Auto-flush if we have too many events
    if (this.events.length >= 100) {
      this.flushEvents();
    }
  }

  // Track page views
  trackPageView(page: string): void {
    this.track('page_view', 'navigation', 'view', page);
  }

  // Track user actions
  trackUserAction(action: string, details?: any): void {
    this.track('user_action', 'interaction', action, JSON.stringify(details));
  }

  // Track performance metrics
  trackPerformance(metric: string, value: number, category: string = 'performance'): void {
    this.track('performance', category, metric, undefined, value);
  }

  // Track errors
  trackError(error: Error, context?: string): void {
    this.track('error', 'application', 'error', `${error.name}: ${error.message}`, context ? context.length : undefined);
  }

  // Track feature usage
  trackFeatureUsage(feature: string, action: string): void {
    this.track('feature_usage', feature, action);
  }

  // Get usage statistics
  getUsageStats(): any {
    const stats = {
      totalEvents: this.events.length,
      sessionEvents: this.events.filter(e => e.sessionId === this.sessionId).length,
      categories: {} as Record<string, number>,
      actions: {} as Record<string, number>,
      timeRange: {
        start: this.events.length > 0 ? Math.min(...this.events.map(e => e.timestamp)) : 0,
        end: this.events.length > 0 ? Math.max(...this.events.map(e => e.timestamp)) : 0
      }
    };

    this.events.forEach(event => {
      stats.categories[event.category] = (stats.categories[event.category] || 0) + 1;
      stats.actions[event.action] = (stats.actions[event.action] || 0) + 1;
    });

    return stats;
  }

  // Flush events (send to server or process locally)
  flushEvents(): void {
    if (this.events.length === 0) return;

    // In a real application, you would send these to your analytics server
    console.group('📊 ORMEN Analytics Report');
    console.log('Events to flush:', this.events.length);
    console.log('Usage stats:', this.getUsageStats());
    console.groupEnd();

    // Clear events after flushing
    this.events = [];
    this.saveEvents();
  }

  // Enable/disable analytics
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    localStorage.setItem('ormen_analytics_enabled', enabled.toString());
  }

  // Clear all analytics data
  clearData(): void {
    this.events = [];
    localStorage.removeItem('ormen_analytics_events');
  }
}

// Export singleton instance
export const analytics = AnalyticsService.getInstance();

// React hook for analytics
export const useAnalytics = () => {
  return {
    track: analytics.track.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackUserAction: analytics.trackUserAction.bind(analytics),
    trackPerformance: analytics.trackPerformance.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackFeatureUsage: analytics.trackFeatureUsage.bind(analytics),
    getUsageStats: analytics.getUsageStats.bind(analytics)
  };
};

// Auto-track page navigation
export const setupAutoTracking = () => {
  // Track initial page load
  analytics.trackPageView(window.location.pathname);

  // Track clicks on important elements
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    
    if (target.tagName === 'BUTTON') {
      analytics.trackUserAction('button_click', {
        text: target.textContent?.trim(),
        className: target.className
      });
    }
    
    if (target.tagName === 'A') {
      analytics.trackUserAction('link_click', {
        href: (target as HTMLAnchorElement).href,
        text: target.textContent?.trim()
      });
    }
  });

  // Track form submissions
  document.addEventListener('submit', (event) => {
    const form = event.target as HTMLFormElement;
    analytics.trackUserAction('form_submit', {
      action: form.action,
      method: form.method
    });
  });
};