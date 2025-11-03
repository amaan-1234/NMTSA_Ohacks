const admin = require("firebase-admin");

class AnalyticsService {
  constructor() {
    this.db = admin.firestore();
  }

  // Revenue Analytics Methods
  async trackRevenueTransaction(transactionData) {
    try {
      const result = await this.db.collection('revenue_transactions').add({
        userId: transactionData.userId,
        courseId: transactionData.courseId,
        amount: transactionData.amount,
        currency: transactionData.currency || 'USD',
        paymentMethod: transactionData.paymentMethod,
        stripeSessionId: transactionData.stripeSessionId,
        status: transactionData.status,
        completedAt: transactionData.completedAt || admin.firestore.FieldValue.serverTimestamp(),
        refundedAt: transactionData.refundedAt,
        metadata: transactionData.metadata,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Update monthly revenue
      await this.updateMonthlyRevenue(transactionData);
      
      return { id: result.id, ...transactionData };
    } catch (error) {
      console.error('Error tracking revenue transaction:', error);
      throw error;
    }
  }

  async updateMonthlyRevenue(transactionData) {
    try {
      const date = new Date(transactionData.completedAt || new Date());
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthId = `${year}-${month}`;

      const monthlyRef = this.db.collection('monthly_revenue').doc(monthId);
      const monthlyDoc = await monthlyRef.get();

      if (monthlyDoc.exists) {
        // Update existing record
        await monthlyRef.update({
          totalRevenue: admin.firestore.FieldValue.increment(transactionData.amount),
          totalTransactions: admin.firestore.FieldValue.increment(1),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      } else {
        // Create new record
        await monthlyRef.set({
          year,
          month,
          totalRevenue: transactionData.amount,
          totalTransactions: 1,
          newCustomers: 1,
          averageOrderValue: transactionData.amount,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error updating monthly revenue:', error);
    }
  }

  async getRevenueAnalytics(startDate, endDate) {
    try {
      const transactions = await this.db.collection('revenue_transactions')
        .where('createdAt', '>=', startDate)
        .where('createdAt', '<=', endDate)
        .where('status', '==', 'completed')
        .orderBy('createdAt', 'desc')
        .limit(100)
        .get();

      const monthlyData = await this.db.collection('monthly_revenue')
        .orderBy('year')
        .orderBy('month')
        .get();

      const transactionList = [];
      transactions.forEach(doc => {
        transactionList.push({ id: doc.id, ...doc.data() });
      });

      const monthlyList = [];
      monthlyData.forEach(doc => {
        monthlyList.push({ id: doc.id, ...doc.data() });
      });

      // Calculate metrics
      const totalRevenue = transactionList.reduce((sum, t) => sum + (t.amount || 0), 0);
      const totalTransactions = transactionList.length;
      const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
      const uniqueCustomers = new Set(transactionList.map(t => t.userId)).size;

      return {
        totalRevenue,
        totalTransactions,
        averageOrderValue,
        uniqueCustomers,
        monthlyBreakdown: monthlyList,
        transactions: transactionList
      };
    } catch (error) {
      console.error('Error getting revenue analytics:', error);
      throw error;
    }
  }

  // User Engagement Methods
  async trackUserSession(sessionData) {
    try {
      const result = await this.db.collection('user_sessions').add({
        userId: sessionData.userId,
        sessionStart: sessionData.sessionStart || admin.firestore.FieldValue.serverTimestamp(),
        sessionEnd: sessionData.sessionEnd,
        duration: sessionData.duration,
        pageViews: sessionData.pageViews || 0,
        coursesAccessed: sessionData.coursesAccessed || 0,
        deviceType: sessionData.deviceType,
        browser: sessionData.browser,
        location: sessionData.location,
        referrer: sessionData.referrer,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { id: result.id, ...sessionData };
    } catch (error) {
      console.error('Error tracking user session:', error);
      throw error;
    }
  }

  async trackCourseProgress(progressData) {
    try {
      const result = await this.db.collection('course_progress').add({
        userId: progressData.userId,
        courseId: progressData.courseId,
        enrollmentDate: progressData.enrollmentDate || admin.firestore.FieldValue.serverTimestamp(),
        completionDate: progressData.completionDate,
        progressPercentage: progressData.progressPercentage || 0,
        timeSpent: progressData.timeSpent || 0,
        lastAccessed: progressData.lastAccessed || admin.firestore.FieldValue.serverTimestamp(),
        isCompleted: progressData.isCompleted || false,
        certificateIssued: progressData.certificateIssued || false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { id: result.id, ...progressData };
    } catch (error) {
      console.error('Error tracking course progress:', error);
      throw error;
    }
  }

  async getUserEngagementMetrics(startDate, endDate) {
    try {
      const sessions = await this.db.collection('user_sessions')
        .where('sessionStart', '>=', startDate)
        .where('sessionStart', '<=', endDate)
        .get();

      const progress = await this.db.collection('course_progress')
        .where('enrollmentDate', '>=', startDate)
        .where('enrollmentDate', '<=', endDate)
        .get();

      const sessionList = [];
      sessions.forEach(doc => {
        sessionList.push({ id: doc.id, ...doc.data() });
      });

      const progressList = [];
      progress.forEach(doc => {
        progressList.push({ id: doc.id, ...doc.data() });
      });

      // Calculate metrics
      const totalSessions = sessionList.length;
      const uniqueUsers = new Set(sessionList.map(s => s.userId)).size;
      const averageSessionDuration = sessionList.reduce((sum, s) => sum + (s.duration || 0), 0) / totalSessions;
      const totalEnrollments = progressList.length;
      const totalCompletions = progressList.filter(p => p.isCompleted).length;
      const completionRate = totalEnrollments > 0 ? (totalCompletions / totalEnrollments) * 100 : 0;

      // Calculate retention (simplified)
      const retentionData = await this.calculateUserRetention(startDate, endDate);

      return {
        totalSessions,
        uniqueUsers,
        averageSessionDuration,
        totalEnrollments,
        totalCompletions,
        completionRate,
        retentionRate: retentionData.retentionRate,
        dailyActiveUsers: await this.getDailyActiveUsers(startDate, endDate)
      };
    } catch (error) {
      console.error('Error getting user engagement metrics:', error);
      throw error;
    }
  }

  async calculateUserRetention(startDate, endDate) {
    try {
      // Simplified retention calculation
      const newUsers = await this.db.collection('user_sessions')
        .where('sessionStart', '>=', startDate)
        .where('sessionStart', '<=', endDate)
        .get();

      const userIds = [...new Set(newUsers.docs.map(doc => doc.data().userId))];
      let retainedUsers = 0;

      for (const userId of userIds) {
        const firstSession = newUsers.docs.find(doc => doc.data().userId === userId);
        const sevenDaysLater = new Date(firstSession.data().sessionStart.toDate().getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const returnSession = await this.db.collection('user_sessions')
          .where('userId', '==', userId)
          .where('sessionStart', '>=', sevenDaysLater)
          .limit(1)
          .get();

        if (!returnSession.empty) {
          retainedUsers++;
        }
      }

      const retentionRate = userIds.length > 0 ? (retainedUsers / userIds.length) * 100 : 0;

      return {
        totalNewUsers: userIds.length,
        retainedUsers,
        retentionRate
      };
    } catch (error) {
      console.error('Error calculating user retention:', error);
      return { totalNewUsers: 0, retainedUsers: 0, retentionRate: 0 };
    }
  }

  async getDailyActiveUsers(startDate, endDate) {
    try {
      const dailyData = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dayStart = new Date(currentDate);
        const dayEnd = new Date(currentDate);
        dayEnd.setHours(23, 59, 59, 999);

        const daySessions = await this.db.collection('user_sessions')
          .where('sessionStart', '>=', dayStart)
          .where('sessionStart', '<=', dayEnd)
          .get();

        const uniqueUsers = new Set(daySessions.docs.map(doc => doc.data().userId)).size;
        
        dailyData.push({
          date: currentDate.toISOString().split('T')[0],
          activeUsers: uniqueUsers
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return dailyData;
    } catch (error) {
      console.error('Error getting daily active users:', error);
      return [];
    }
  }

  // Content Performance Methods
  async trackCourseInteraction(interactionData) {
    try {
      const result = await this.db.collection('course_interactions').add({
        userId: interactionData.userId,
        courseId: interactionData.courseId,
        interactionType: interactionData.interactionType,
        timestamp: interactionData.timestamp || admin.firestore.FieldValue.serverTimestamp(),
        duration: interactionData.duration,
        progress: interactionData.progress,
        metadata: interactionData.metadata,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { id: result.id, ...interactionData };
    } catch (error) {
      console.error('Error tracking course interaction:', error);
      throw error;
    }
  }

  async getContentPerformanceMetrics(startDate, endDate) {
    try {
      const interactions = await this.db.collection('course_interactions')
        .where('timestamp', '>=', startDate)
        .where('timestamp', '<=', endDate)
        .get();

      const progress = await this.db.collection('course_progress')
        .where('enrollmentDate', '>=', startDate)
        .where('enrollmentDate', '<=', endDate)
        .get();

      const interactionList = [];
      interactions.forEach(doc => {
        interactionList.push({ id: doc.id, ...doc.data() });
      });

      const progressList = [];
      progress.forEach(doc => {
        progressList.push({ id: doc.id, ...doc.data() });
      });

      // Group by course
      const courseStats = {};
      
      // Process interactions
      interactionList.forEach(interaction => {
        if (!courseStats[interaction.courseId]) {
          courseStats[interaction.courseId] = {
            courseId: interaction.courseId,
            views: 0,
            enrollments: 0,
            completions: 0,
            totalTimeSpent: 0,
            averageRating: 0,
            dropOffPoints: [],
            interactions: []
          };
        }
        
        courseStats[interaction.courseId].interactions.push(interaction);
        
        if (interaction.interactionType === 'video_play') {
          courseStats[interaction.courseId].views++;
        }
        
        if (interaction.duration) {
          courseStats[interaction.courseId].totalTimeSpent += interaction.duration;
        }
      });

      // Process progress
      progressList.forEach(prog => {
        if (!courseStats[prog.courseId]) {
          courseStats[prog.courseId] = {
            courseId: prog.courseId,
            views: 0,
            enrollments: 0,
            completions: 0,
            totalTimeSpent: 0,
            averageRating: 0,
            dropOffPoints: [],
            interactions: []
          };
        }
        
        courseStats[prog.courseId].enrollments++;
        
        if (prog.isCompleted) {
          courseStats[prog.courseId].completions++;
        }
        
        if (prog.timeSpent) {
          courseStats[prog.courseId].totalTimeSpent += prog.timeSpent;
        }
      });

      // Calculate drop-off points
      Object.values(courseStats).forEach(course => {
        const videoInteractions = course.interactions.filter(i => i.interactionType === 'video_play');
        const progressPoints = videoInteractions.map(i => i.progress || 0);
        
        // Find common drop-off points
        const progressCounts = {};
        progressPoints.forEach(progress => {
          const roundedProgress = Math.round(progress / 10) * 10;
          progressCounts[roundedProgress] = (progressCounts[roundedProgress] || 0) + 1;
        });
        
        course.dropOffPoints = Object.entries(progressCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([progress, count]) => ({ progress: parseInt(progress), count }));
      });

      // Sort by popularity
      const sortedCourses = Object.values(courseStats)
        .sort((a, b) => (b.views + b.enrollments) - (a.views + a.enrollments));

      return {
        totalCourses: sortedCourses.length,
        mostPopularCourses: sortedCourses.slice(0, 10),
        averageCompletionRate: sortedCourses.reduce((sum, c) => 
          sum + (c.enrollments > 0 ? c.completions / c.enrollments : 0), 0) / sortedCourses.length * 100,
        coursesWithDropOffs: sortedCourses.filter(c => c.dropOffPoints.length > 0),
        totalInteractions: interactionList.length,
        averageRating: 4.2 // Default rating for now
      };
    } catch (error) {
      console.error('Error getting content performance metrics:', error);
      throw error;
    }
  }

  async generateDailyAnalytics(date) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const sessions = await this.db.collection('user_sessions')
        .where('sessionStart', '>=', startOfDay)
        .where('sessionStart', '<=', endOfDay)
        .get();

      const progress = await this.db.collection('course_progress')
        .where('enrollmentDate', '>=', startOfDay)
        .where('enrollmentDate', '<=', endOfDay)
        .get();

      const transactions = await this.db.collection('revenue_transactions')
        .where('createdAt', '>=', startOfDay)
        .where('createdAt', '<=', endOfDay)
        .where('status', '==', 'completed')
        .get();

      const uniqueUsers = new Set(sessions.docs.map(doc => doc.data().userId)).size;
      const totalRevenue = transactions.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
      const completions = progress.docs.filter(doc => doc.data().isCompleted).length;
      const certificates = progress.docs.filter(doc => doc.data().certificateIssued).length;
      const avgSessionDuration = sessions.docs.reduce((sum, doc) => sum + (doc.data().duration || 0), 0) / sessions.docs.length;

      const analytics = {
        date: startOfDay,
        totalUsers: uniqueUsers,
        activeUsers: uniqueUsers,
        totalRevenue,
        coursesCompleted: completions,
        certificatesIssued: certificates,
        averageSessionDuration: Math.round(avgSessionDuration)
      };

      // Store in daily analytics collection
      await this.db.collection('daily_analytics').doc(date.toISOString().split('T')[0]).set(analytics);

      return analytics;
    } catch (error) {
      console.error('Error generating daily analytics:', error);
      throw error;
    }
  }

  async getAnalyticsDashboard(startDate, endDate) {
    try {
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
    } catch (error) {
      console.error('Error getting analytics dashboard:', error);
      throw error;
    }
  }
}

module.exports = AnalyticsService;
