import { useAuth } from "@/state/auth";
import { useCallback, useEffect, useRef } from "react";

interface AnalyticsEvent {
  userId: string;
  courseId?: string;
  interactionType: string;
  timestamp: Date;
  duration?: number;
  progress?: number;
  metadata?: Record<string, any>;
}

interface SessionData {
  userId: string;
  sessionStart: Date;
  sessionEnd?: Date;
  duration?: number;
  pageViews: number;
  coursesAccessed: number;
  deviceType: string;
  browser: string;
  location?: string;
  referrer?: string;
}

class AnalyticsTracker {
  private sessionId: string;
  private sessionStart: Date;
  private pageViews: number = 0;
  private coursesAccessed: Set<string> = new Set();
  private lastActivity: Date = new Date();

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStart = new Date();
    this.trackPageView();
    this.startInactivityTimer();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDeviceType(): string {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) return 'mobile';
    return 'desktop';
  }

  private getBrowser(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private trackPageView(): void {
    this.pageViews++;
    this.lastActivity = new Date();
  }

  private startInactivityTimer(): void {
    const inactivityTimeout = 30 * 60 * 1000; // 30 minutes
    
    const resetTimer = () => {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = setTimeout(() => {
        this.endSession();
      }, inactivityTimeout);
    };

    // Track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, () => {
        this.lastActivity = new Date();
        resetTimer();
      }, true);
    });

    resetTimer();
  }

  private inactivityTimer?: NodeJS.Timeout;

  public trackCourseInteraction(event: Omit<AnalyticsEvent, 'userId' | 'timestamp'>): void {
    this.trackEvent({
      ...event,
      timestamp: new Date(),
    });
  }

  public trackCourseAccess(courseId: string): void {
    this.coursesAccessed.add(courseId);
    this.trackCourseInteraction({
      courseId,
      interactionType: 'course_access',
    });
  }

  public trackVideoPlay(courseId: string, progress?: number): void {
    this.trackCourseInteraction({
      courseId,
      interactionType: 'video_play',
      progress,
    });
  }

  public trackVideoPause(courseId: string, progress?: number, duration?: number): void {
    this.trackCourseInteraction({
      courseId,
      interactionType: 'video_pause',
      progress,
      duration,
    });
  }

  public trackQuizStart(courseId: string): void {
    this.trackCourseInteraction({
      courseId,
      interactionType: 'quiz_start',
    });
  }

  public trackQuizComplete(courseId: string, score?: number): void {
    this.trackCourseInteraction({
      courseId,
      interactionType: 'quiz_complete',
      metadata: { score },
    });
  }

  public trackCourseEnrollment(courseId: string): void {
    this.trackCourseInteraction({
      courseId,
      interactionType: 'course_enrollment',
    });
  }

  public trackCourseCompletion(courseId: string): void {
    this.trackCourseInteraction({
      courseId,
      interactionType: 'course_completion',
    });
  }

  public trackCertificateDownload(courseId: string): void {
    this.trackCourseInteraction({
      courseId,
      interactionType: 'certificate_download',
    });
  }

  public trackCourseProgress(courseId: string, progress: number): void {
    this.trackCourseInteraction({
      courseId,
      interactionType: 'course_progress',
      progress,
    });
  }

  public trackRevenueTransaction(transactionData: {
    courseId: string;
    amount: number;
    currency?: string;
    paymentMethod?: string;
    stripeSessionId?: string;
    status: string;
  }): void {
    this.trackEvent({
      courseId: transactionData.courseId,
      interactionType: 'revenue_transaction',
      metadata: transactionData,
    });
  }

  private async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      await fetch('/api/analytics/interaction/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }
  }

  public async endSession(): Promise<void> {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }

    const sessionData: SessionData = {
      userId: '', // Will be set by the hook
      sessionStart: this.sessionStart,
      sessionEnd: new Date(),
      duration: Math.floor((new Date().getTime() - this.sessionStart.getTime()) / 1000),
      pageViews: this.pageViews,
      coursesAccessed: this.coursesAccessed.size,
      deviceType: this.getDeviceType(),
      browser: this.getBrowser(),
      location: navigator.language,
      referrer: document.referrer || undefined,
    };

    try {
      await fetch('/api/analytics/session/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });
    } catch (error) {
      console.error('Failed to track session:', error);
    }
  }

  public getSessionId(): string {
    return this.sessionId;
  }
}

// Global analytics tracker instance
let analyticsTracker: AnalyticsTracker | null = null;

export const useAnalytics = () => {
  const { user } = useAuth();
  const trackerRef = useRef<AnalyticsTracker | null>(null);

  // Initialize tracker when user logs in
  useEffect(() => {
    if (user && !trackerRef.current) {
      analyticsTracker = new AnalyticsTracker();
      trackerRef.current = analyticsTracker;
    } else if (!user && trackerRef.current) {
      // End session when user logs out
      trackerRef.current.endSession();
      analyticsTracker = null;
      trackerRef.current = null;
    }
  }, [user]);

  // Update session data with user ID
  useEffect(() => {
    if (trackerRef.current && user) {
      // Update the session with user ID
      const updateSession = async () => {
        try {
          await fetch('/api/analytics/session/track', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.uid,
              sessionId: trackerRef.current?.getSessionId(),
            }),
          });
        } catch (error) {
          console.error('Failed to update session with user ID:', error);
        }
      };
      updateSession();
    }
  }, [user]);

  const trackCourseInteraction = useCallback((event: Omit<AnalyticsEvent, 'userId' | 'timestamp'>) => {
    if (trackerRef.current && user) {
      trackerRef.current.trackCourseInteraction(event);
    }
  }, [user]);

  const trackCourseAccess = useCallback((courseId: string) => {
    if (trackerRef.current && user) {
      trackerRef.current.trackCourseAccess(courseId);
    }
  }, [user]);

  const trackVideoPlay = useCallback((courseId: string, progress?: number) => {
    if (trackerRef.current && user) {
      trackerRef.current.trackVideoPlay(courseId, progress);
    }
  }, [user]);

  const trackVideoPause = useCallback((courseId: string, progress?: number, duration?: number) => {
    if (trackerRef.current && user) {
      trackerRef.current.trackVideoPause(courseId, progress, duration);
    }
  }, [user]);

  const trackQuizStart = useCallback((courseId: string) => {
    if (trackerRef.current && user) {
      trackerRef.current.trackQuizStart(courseId);
    }
  }, [user]);

  const trackQuizComplete = useCallback((courseId: string, score?: number) => {
    if (trackerRef.current && user) {
      trackerRef.current.trackQuizComplete(courseId, score);
    }
  }, [user]);

  const trackCourseEnrollment = useCallback((courseId: string) => {
    if (trackerRef.current && user) {
      trackerRef.current.trackCourseEnrollment(courseId);
    }
  }, [user]);

  const trackCourseCompletion = useCallback((courseId: string) => {
    if (trackerRef.current && user) {
      trackerRef.current.trackCourseCompletion(courseId);
    }
  }, [user]);

  const trackCertificateDownload = useCallback((courseId: string) => {
    if (trackerRef.current && user) {
      trackerRef.current.trackCertificateDownload(courseId);
    }
  }, [user]);

  const trackCourseProgress = useCallback((courseId: string, progress: number) => {
    if (trackerRef.current && user) {
      trackerRef.current.trackCourseProgress(courseId, progress);
    }
  }, [user]);

  const trackRevenueTransaction = useCallback((transactionData: {
    courseId: string;
    amount: number;
    currency?: string;
    paymentMethod?: string;
    stripeSessionId?: string;
    status: string;
  }) => {
    if (trackerRef.current && user) {
      trackerRef.current.trackRevenueTransaction(transactionData);
    }
  }, [user]);

  return {
    trackCourseInteraction,
    trackCourseAccess,
    trackVideoPlay,
    trackVideoPause,
    trackQuizStart,
    trackQuizComplete,
    trackCourseEnrollment,
    trackCourseCompletion,
    trackCertificateDownload,
    trackCourseProgress,
    trackRevenueTransaction,
  };
};

export default useAnalytics;
