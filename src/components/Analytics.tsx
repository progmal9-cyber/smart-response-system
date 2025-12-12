import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, MessageSquare, Bot, Users, Clock } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsData {
  conversationsOverTime: Array<{ date: string; count: number }>;
  repliesByType: Array<{ name: string; value: number }>;
  topQuestions: Array<{ question: string; count: number }>;
  campaignPerformance: Array<{ campaign: string; conversions: number }>;
  aiPerformance: {
    totalReplies: number;
    successRate: number;
    avgResponseTime: number;
  };
  dailyStats: {
    newConversations: number;
    autoReplies: number;
    manualReplies: number;
    activeUsers: number;
  };
}

export function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5c72f45a/analytics?range=${timeRange}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">لا توجد بيانات للعرض</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-gray-900">الإحصائيات والتحليلات</h2>
            <p className="text-gray-600">تحليل شامل لأداء النظام</p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === '7d'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            7 أيام
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === '30d'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            30 يوم
          </button>
          <button
            onClick={() => setTimeRange('90d')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === '90d'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            90 يوم
          </button>
        </div>
      </div>

      {/* Daily Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-50 p-3 rounded-xl">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-gray-600 mb-1">محادثات جديدة</p>
          <div className="text-gray-900">{data.dailyStats.newConversations}</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-50 p-3 rounded-xl">
              <Bot className="w-6 h-6 text-purple-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-gray-600 mb-1">ردود تلقائية</p>
          <div className="text-gray-900">{data.dailyStats.autoReplies}</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-50 p-3 rounded-xl">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-gray-600 mb-1">مستخدمين نشطين</p>
          <div className="text-gray-900">{data.dailyStats.activeUsers}</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-50 p-3 rounded-xl">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-gray-600 mb-1">وقت الرد (ثانية)</p>
          <div className="text-gray-900">{data.aiPerformance.avgResponseTime}</div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversations Over Time */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-gray-900 mb-6">المحادثات عبر الوقت</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.conversationsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Replies by Type */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-gray-900 mb-6">توزيع الردود</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.repliesByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.repliesByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Performance */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-gray-900 mb-6">أداء الحملات</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.campaignPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="campaign" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="conversions" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Questions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-gray-900 mb-6">الأسئلة الأكثر تكراراً</h3>
          <div className="space-y-4">
            {data.topQuestions.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 truncate">{item.question}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                      style={{
                        width: `${(item.count / data.topQuestions[0].count) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <span className="text-gray-600 flex-shrink-0">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Performance Summary */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-6">
          <Bot className="w-8 h-8" />
          <h3 className="text-white">أداء الذكاء الاصطناعي</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-white/80 mb-2">إجمالي الردود التلقائية</p>
            <div className="text-white">{data.aiPerformance.totalReplies.toLocaleString('ar-SA')}</div>
          </div>
          <div>
            <p className="text-white/80 mb-2">معدل النجاح</p>
            <div className="text-white">{data.aiPerformance.successRate}%</div>
          </div>
          <div>
            <p className="text-white/80 mb-2">متوسط وقت الرد</p>
            <div className="text-white">{data.aiPerformance.avgResponseTime} ثانية</div>
          </div>
        </div>
      </div>
    </div>
  );
}
