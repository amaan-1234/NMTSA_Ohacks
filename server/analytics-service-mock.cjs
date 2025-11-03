class MockAnalyticsService {
  constructor() {
    console.log("📊 Using Mock Analytics Service for development");
  }

  async trackRevenueTransaction(transactionData) {
    console.log("📊 Mock: Tracking revenue transaction", transactionData);
    return { id: "mock_" + Date.now(), ...transactionData };
  }

  async updateMonthlyRevenue(transactionData) {
    console.log("📊 Mock: Updating monthly revenue", transactionData);
  }

  async getRevenueAnalytics(startDate, endDate) {
    console.log("📊 Mock: Getting revenue analytics", { startDate, endDate });
    return {
      totalRevenue: 12500.00,
      totalTransactions: 45,
      averageOrderValue: 277.78,
      uniqueCustomers: 38,
      monthlyBreakdown: [
        { year: 2024, month: 10, totalRevenue: "12500.00", totalTransactions: 45 }
      ],
      transactions: []
    };
  }

  async trackUserSession(sessionData) {
    console.log("📊 Mock: Tracking user session", sessionData);
    return { id: "mock_session_" + Date.now(), ...sessionData };
  }

  async trackCourseProgress(progressData) {
    console.log("📊 Mock: Tracking course progress", progressData);
    return { id: "mock_progress_" + Date.now(), ...progressData };
  }

  async getUserEngagementMetrics(startDate, endDate) {
    console.log("📊 Mock: Getting user engagement metrics", { startDate, endDate });
    return {
      totalSessions: 156,
      uniqueUsers: 89,
      averageSessionDuration: 1847,
      totalEnrollments: 67,
      totalCompletions: 23,
      completionRate: 34.3,
      retentionRate: 78.5,
      dailyActiveUsers: [
        { date: "2024-10-15", activeUsers: 12 },
        { date: "2024-10-16", activeUsers: 15 },
        { date: "2024-10-17", activeUsers: 18 }
      ]
    };
  }

  async calculateUserRetention(startDate, endDate) {
    console.log("📊 Mock: Calculating user retention", { startDate, endDate });
    return {
      totalNewUsers: 25,
      retainedUsers: 18,
      retentionRate: 72.0
    };
  }

  async getDailyActiveUsers(startDate, endDate) {
    console.log("📊 Mock: Getting daily active users", { startDate, endDate });
    return [
      { date: "2024-10-15", activeUsers: 12 },
      { date: "2024-10-16", activeUsers: 15 },
      { date: "2024-10-17", activeUsers: 18 }
    ];
  }

  async trackCourseInteraction(interactionData) {
    console.log("📊 Mock: Tracking course interaction", interactionData);
    return { id: "mock_interaction_" + Date.now(), ...interactionData };
  }

  async getContentPerformanceMetrics(startDate, endDate) {
    console.log("📊 Mock: Getting content performance metrics", { startDate, endDate });
    return {
      totalCourses: 8,
      mostPopularCourses: [
        {
          courseId: "course-1",
          views: 145,
          enrollments: 23,
          completions: 8,
          averageRating: 4.5
        },
        {
          courseId: "course-2", 
          views: 98,
          enrollments: 18,
          completions: 6,
          averageRating: 4.2
        }
      ],
      averageCompletionRate: 34.3,
      coursesWithDropOffs: [
        {
          courseId: "course-1",
          dropOffPoints: [
            { progress: 20, count: 5 },
            { progress: 50, count: 3 },
            { progress: 80, count: 2 }
          ]
        }
      ],
      totalInteractions: 234,
      averageRating: 4.3
    };
  }

  async generateDailyAnalytics(date) {
    console.log("📊 Mock: Generating daily analytics", date);
    return {
      date: date,
      totalUsers: 18,
      activeUsers: 18,
      totalRevenue: 1250.00,
      coursesCompleted: 3,
      certificatesIssued: 3,
      averageSessionDuration: 1847
    };
  }

  async getAnalyticsDashboard(startDate, endDate) {
    console.log("📊 Mock: Getting analytics dashboard", { startDate, endDate });
    
    const revenue = await this.getRevenueAnalytics(startDate, endDate);
    const engagement = await this.getUserEngagementMetrics(startDate, endDate);
    const content = await this.getContentPerformanceMetrics(startDate, endDate);

    return {
      revenue,
      engagement,
      content,
      summary: {
        totalRevenue: revenue.totalRevenue,
        totalUsers: engagement.uniqueUsers,
        completionRate: engagement.completionRate,
        averageRating: content.averageRating,
        mostPopularCourse: content.mostPopularCourses[0]?.courseId || null
      }
    };
  }
}

module.exports = MockAnalyticsService;
