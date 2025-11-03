import { pgTable, text, timestamp, integer, decimal, boolean, jsonb } from 'drizzle-orm/pg-core';

// Revenue Analytics Tables
export const revenueTransactions = pgTable('revenue_transactions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  courseId: text('course_id').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('USD'),
  paymentMethod: text('payment_method'), // 'stripe', 'paypal', etc.
  stripeSessionId: text('stripe_session_id'),
  status: text('status').notNull(), // 'completed', 'pending', 'failed', 'refunded'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  refundedAt: timestamp('refunded_at'),
  metadata: jsonb('metadata'), // Additional transaction data
});

export const monthlyRevenue = pgTable('monthly_revenue', {
  id: text('id').primaryKey(),
  year: integer('year').notNull(),
  month: integer('month').notNull(), // 1-12
  totalRevenue: decimal('total_revenue', { precision: 10, scale: 2 }).notNull(),
  totalTransactions: integer('total_transactions').notNull(),
  newCustomers: integer('new_customers').notNull(),
  recurringRevenue: decimal('recurring_revenue', { precision: 10, scale: 2 }),
  averageOrderValue: decimal('average_order_value', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User Engagement Tables
export const userSessions = pgTable('user_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  sessionStart: timestamp('session_start').defaultNow().notNull(),
  sessionEnd: timestamp('session_end'),
  duration: integer('duration'), // in seconds
  pageViews: integer('page_views').default(0),
  coursesAccessed: integer('courses_accessed').default(0),
  deviceType: text('device_type'), // 'desktop', 'mobile', 'tablet'
  browser: text('browser'),
  location: text('location'),
  referrer: text('referrer'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const courseProgress = pgTable('course_progress', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  courseId: text('course_id').notNull(),
  enrollmentDate: timestamp('enrollment_date').defaultNow().notNull(),
  completionDate: timestamp('completion_date'),
  progressPercentage: integer('progress_percentage').default(0),
  timeSpent: integer('time_spent').default(0), // in seconds
  lastAccessed: timestamp('last_accessed').defaultNow().notNull(),
  isCompleted: boolean('is_completed').default(false),
  certificateIssued: boolean('certificate_issued').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userEngagement = pgTable('user_engagement', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  date: timestamp('date').defaultNow().notNull(),
  loginCount: integer('login_count').default(0),
  coursesStarted: integer('courses_started').default(0),
  coursesCompleted: integer('courses_completed').default(0),
  timeSpentLearning: integer('time_spent_learning').default(0), // in seconds
  certificatesEarned: integer('certificates_earned').default(0),
  forumPosts: integer('forum_posts').default(0),
  quizAttempts: integer('quiz_attempts').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Content Performance Tables
export const courseAnalytics = pgTable('course_analytics', {
  id: text('id').primaryKey(),
  courseId: text('course_id').notNull(),
  date: timestamp('date').defaultNow().notNull(),
  views: integer('views').default(0),
  enrollments: integer('enrollments').default(0),
  completions: integer('completions').default(0),
  dropOffRate: decimal('drop_off_rate', { precision: 5, scale: 2 }),
  averageRating: decimal('average_rating', { precision: 3, scale: 2 }),
  totalRevenue: decimal('total_revenue', { precision: 10, scale: 2 }).default('0'),
  timeSpent: integer('time_spent').default(0), // in seconds
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const courseInteractions = pgTable('course_interactions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  courseId: text('course_id').notNull(),
  interactionType: text('interaction_type').notNull(), // 'video_play', 'video_pause', 'quiz_start', 'quiz_complete', 'download', 'forum_post'
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  duration: integer('duration'), // for video interactions
  progress: integer('progress'), // for video progress
  metadata: jsonb('metadata'), // Additional interaction data
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userFeedback = pgTable('user_feedback', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  courseId: text('course_id').notNull(),
  rating: integer('rating').notNull(), // 1-5 stars
  review: text('review'),
  feedbackType: text('feedback_type'), // 'course', 'instructor', 'content', 'platform'
  isPublic: boolean('is_public').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Analytics Summary Tables for Performance
export const dailyAnalytics = pgTable('daily_analytics', {
  id: text('id').primaryKey(),
  date: timestamp('date').defaultNow().notNull(),
  totalUsers: integer('total_users').default(0),
  activeUsers: integer('active_users').default(0),
  newUsers: integer('new_users').default(0),
  totalRevenue: decimal('total_revenue', { precision: 10, scale: 2 }).default('0'),
  coursesCompleted: integer('courses_completed').default(0),
  certificatesIssued: integer('certificates_issued').default(0),
  averageSessionDuration: integer('average_session_duration').default(0),
  bounceRate: decimal('bounce_rate', { precision: 5, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const weeklyAnalytics = pgTable('weekly_analytics', {
  id: text('id').primaryKey(),
  weekStart: timestamp('week_start').notNull(),
  weekEnd: timestamp('week_end').notNull(),
  totalUsers: integer('total_users').default(0),
  activeUsers: integer('active_users').default(0),
  newUsers: integer('new_users').default(0),
  totalRevenue: decimal('total_revenue', { precision: 10, scale: 2 }).default('0'),
  coursesCompleted: integer('courses_completed').default(0),
  certificatesIssued: integer('certificates_issued').default(0),
  userRetentionRate: decimal('user_retention_rate', { precision: 5, scale: 2 }),
  averageCourseCompletionTime: integer('average_course_completion_time').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const monthlyAnalytics = pgTable('monthly_analytics', {
  id: text('id').primaryKey(),
  year: integer('year').notNull(),
  month: integer('month').notNull(),
  totalUsers: integer('total_users').default(0),
  activeUsers: integer('active_users').default(0),
  newUsers: integer('new_users').default(0),
  totalRevenue: decimal('total_revenue', { precision: 10, scale: 2 }).default('0'),
  coursesCompleted: integer('courses_completed').default(0),
  certificatesIssued: integer('certificates_issued').default(0),
  userRetentionRate: decimal('user_retention_rate', { precision: 5, scale: 2 }),
  averageCourseCompletionTime: integer('average_course_completion_time').default(0),
  churnRate: decimal('churn_rate', { precision: 5, scale: 2 }),
  customerLifetimeValue: decimal('customer_lifetime_value', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Export types for TypeScript
export type RevenueTransaction = typeof revenueTransactions.$inferSelect;
export type MonthlyRevenue = typeof monthlyRevenue.$inferSelect;
export type UserSession = typeof userSessions.$inferSelect;
export type CourseProgress = typeof courseProgress.$inferSelect;
export type UserEngagement = typeof userEngagement.$inferSelect;
export type CourseAnalytics = typeof courseAnalytics.$inferSelect;
export type CourseInteraction = typeof courseInteractions.$inferSelect;
export type UserFeedback = typeof userFeedback.$inferSelect;
export type DailyAnalytics = typeof dailyAnalytics.$inferSelect;
export type WeeklyAnalytics = typeof weeklyAnalytics.$inferSelect;
export type MonthlyAnalytics = typeof monthlyAnalytics.$inferSelect;
