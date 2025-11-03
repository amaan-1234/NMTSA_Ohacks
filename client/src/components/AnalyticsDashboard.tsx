import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  BookOpen, 
  Award, 
  Clock, 
  Eye,
  Download,
  Star,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnalyticsData {
  revenue: {
    totalRevenue: number;
    totalTransactions: number;
    averageOrderValue: number;
    uniqueCustomers: number;
    monthlyBreakdown: Array<{
      year: number;
      month: number;
      totalRevenue: string;
      totalTransactions: number;
    }>;
  };
  engagement: {
    totalSessions: number;
    uniqueUsers: number;
    averageSessionDuration: number;
    totalEnrollments: number;
    totalCompletions: number;
    completionRate: number;
    retentionRate: number;
    dailyActiveUsers: Array<{
      date: string;
      activeUsers: number;
    }>;
  };
  content: {
    totalCourses: number;
    mostPopularCourses: Array<{
      courseId: string;
      views: number;
      enrollments: number;
      completions: number;
      averageRating: number;
    }>;
    averageCompletionRate: number;
    coursesWithDropOffs: Array<{
      courseId: string;
      dropOffPoints: Array<{
        progress: number;
        count: number;
      }>;
    }>;
    totalInteractions: number;
    averageRating: number;
  };
}

const AnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = React.useState<AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [dateRange, setDateRange] = React.useState("30"); // days
  const [period, setPeriod] = React.useState("monthly");
  const { toast } = useToast();

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      const response = await fetch(
        `/api/analytics/dashboard?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&period=${period}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      if (data.success) {
        setAnalyticsData(data.dashboard);
      } else {
        throw new Error(data.message || 'Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAnalytics();
  }, [dateRange, period]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center p-8">
        <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
        <p className="text-muted-foreground mb-4">
          Analytics data will appear here once users start interacting with courses.
        </p>
        <Button onClick={fetchAnalytics}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive insights into your platform's performance
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchAnalytics} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analyticsData.revenue.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(analyticsData.revenue.totalTransactions)} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(analyticsData.engagement.uniqueUsers)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(analyticsData.engagement.totalSessions)} sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.engagement.completionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(analyticsData.engagement.totalCompletions)} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.content.averageRating.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(analyticsData.content.totalInteractions)} interactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
          <TabsTrigger value="engagement">User Engagement</TabsTrigger>
          <TabsTrigger value="content">Content Performance</TabsTrigger>
        </TabsList>

        {/* Revenue Analytics Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Revenue</span>
                  <span className="font-bold">{formatCurrency(analyticsData.revenue.totalRevenue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Average Order Value</span>
                  <span className="font-bold">{formatCurrency(analyticsData.revenue.averageOrderValue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Unique Customers</span>
                  <span className="font-bold">{formatNumber(analyticsData.revenue.uniqueCustomers)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Transactions</span>
                  <span className="font-bold">{formatNumber(analyticsData.revenue.totalTransactions)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.revenue.monthlyBreakdown.slice(0, 6).map((month, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">
                        {new Date(month.year, month.month - 1).toLocaleDateString('en-US', { 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{formatCurrency(parseFloat(month.totalRevenue))}</span>
                        <Badge variant="secondary">{month.totalTransactions} txns</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* User Engagement Tab */}
        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Sessions</span>
                  <span className="font-bold">{formatNumber(analyticsData.engagement.totalSessions)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Unique Users</span>
                  <span className="font-bold">{formatNumber(analyticsData.engagement.uniqueUsers)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Avg Session Duration</span>
                  <span className="font-bold">{formatDuration(analyticsData.engagement.averageSessionDuration)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Retention Rate</span>
                  <span className="font-bold">{analyticsData.engagement.retentionRate.toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Enrollments</span>
                  <span className="font-bold">{formatNumber(analyticsData.engagement.totalEnrollments)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Completions</span>
                  <span className="font-bold">{formatNumber(analyticsData.engagement.totalCompletions)}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Completion Rate</span>
                    <span className="font-bold">{analyticsData.engagement.completionRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={analyticsData.engagement.completionRate} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Daily Active Users Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analyticsData.engagement.dailyActiveUsers.slice(-14).map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ 
                            width: `${Math.min(100, (day.activeUsers / Math.max(...analyticsData.engagement.dailyActiveUsers.map(d => d.activeUsers))) * 100)}%` 
                          }}
                        />
                      </div>
                      <span className="font-medium w-12 text-right">{day.activeUsers}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Performance Tab */}
        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Courses</span>
                  <span className="font-bold">{formatNumber(analyticsData.content.totalCourses)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Avg Completion Rate</span>
                  <span className="font-bold">{analyticsData.content.averageCompletionRate.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Interactions</span>
                  <span className="font-bold">{formatNumber(analyticsData.content.totalInteractions)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Average Rating</span>
                  <span className="font-bold">{analyticsData.content.averageRating.toFixed(1)} ⭐</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Most Popular Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.content.mostPopularCourses.slice(0, 5).map((course, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <span className="text-sm font-medium">{course.courseId}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">
                          {formatNumber(course.views)} views
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatNumber(course.enrollments)} enrolled
                        </span>
                        <span className="text-xs font-medium">
                          {course.averageRating.toFixed(1)} ⭐
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Drop-off Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Course Drop-off Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.content.coursesWithDropOffs.slice(0, 5).map((course, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{course.courseId}</span>
                      <Badge variant="destructive">Drop-off Issues</Badge>
                    </div>
                    <div className="space-y-1">
                      {course.dropOffPoints.map((point, pointIndex) => (
                        <div key={pointIndex} className="flex items-center space-x-2">
                          <span className="text-xs text-muted-foreground w-16">
                            {point.progress}%
                          </span>
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div 
                              className="bg-destructive h-2 rounded-full" 
                              style={{ 
                                width: `${Math.min(100, (point.count / Math.max(...course.dropOffPoints.map(p => p.count))) * 100)}%` 
                              }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-12">
                            {point.count} users
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
