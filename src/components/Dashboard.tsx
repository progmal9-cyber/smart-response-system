import React, { useState, useEffect } from 'react';
import { MessageSquare, Users, TrendingUp, Bot, CheckCircle, XCircle, Zap, Megaphone } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

interface Stats {
  totalConversations: number;
  newToday: number;
  aiEnabled: boolean;
  activeCampaigns: number;
  autoReplies: number;
  manualReplies: number;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<Stats>({
    totalConversations: 0,
    newToday: 0,
    aiEnabled: true,
    activeCampaigns: 0,
    autoReplies: 0,
    manualReplies: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5c72f45a/stats`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAI = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5c72f45a/ai/toggle`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ enabled: !stats.aiEnabled }),
        }
      );

      if (response.ok) {
        setStats({ ...stats, aiEnabled: !stats.aiEnabled });
      }
    } catch (error) {
      console.error('Error toggling AI:', error);
    }
  };

  const statCards = [
    {
      title: 'إجمالي المحادثات',
      value: stats.totalConversations,
      icon: MessageSquare,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      onClick: () => onNavigate('conversations'),
    },
    {
      title: 'محادثات جديدة اليوم',
      value: stats.newToday,
      icon: Users,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      onClick: () => onNavigate('conversations'),
    },
    {
      title: 'الحملات النشطة',
      value: stats.activeCampaigns,
      icon: Megaphone,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      onClick: () => onNavigate('campaigns'),
    },
    {
      title: 'الردود التلقائية',
      value: stats.autoReplies,
      icon: Zap,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      onClick: () => onNavigate('analytics'),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Control Banner */}
      <div className={`rounded-xl p-6 shadow-lg ${stats.aiEnabled ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-gray-500 to-gray-600'} text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-white mb-1">حالة الذكاء الاصطناعي</h2>
              <p className="text-white/90">
                {stats.aiEnabled ? 'الذكاء الاصطناعي يعمل ويرد تلقائياً على الاستفسارات' : 'الذكاء الاصطناعي متوقف - يتم إرسال الردود الجاهزة فقط'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleAI}
            className="flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors"
          >
            {stats.aiEnabled ? (
              <>
                <XCircle className="w-5 h-5 text-red-600" />
                <span>إيقاف AI</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>تشغيل AI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <button
              key={index}
              onClick={card.onClick}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 text-right"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${card.bgColor} p-3 rounded-xl`}>
                  <Icon className={`w-6 h-6 ${card.textColor}`} />
                </div>
              </div>
              <p className="text-gray-600 mb-2">{card.title}</p>
              <div className={`bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
                {card.value.toLocaleString('ar-SA')}
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-gray-900 mb-4">إجراءات سريعة</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('campaigns')}
            className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all text-right"
          >
            <Megaphone className="w-5 h-5 text-blue-600" />
            <span className="text-gray-900">إنشاء حملة جديدة</span>
          </button>
          <button
            onClick={() => onNavigate('responses')}
            className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all text-right"
          >
            <MessageSquare className="w-5 h-5 text-purple-600" />
            <span className="text-gray-900">إضافة رد جاهز</span>
          </button>
          <button
            onClick={() => onNavigate('ai')}
            className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all text-right"
          >
            <Bot className="w-5 h-5 text-green-600" />
            <span className="text-gray-900">إدارة قاعدة المعلومات</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-gray-900 mb-4">النشاط الأخير</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <p className="text-gray-700 flex-1">محادثة جديدة من حملة "العرض الصيفي"</p>
            <span className="text-sm text-gray-500">منذ 5 دقائق</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <p className="text-gray-700 flex-1">تم الرد تلقائياً على استفسار عن الأسعار</p>
            <span className="text-sm text-gray-500">منذ 12 دقيقة</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <p className="text-gray-700 flex-1">حملة "المنتج الجديد" حصلت على 15 تفاعل</p>
            <span className="text-sm text-gray-500">منذ 30 دقيقة</span>
          </div>
        </div>
      </div>
    </div>
  );
}
