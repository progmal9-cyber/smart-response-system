import React, { useState, useEffect } from 'react';
import { MessageSquare, Settings, BarChart3, Bot, MessageCircle, Megaphone } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { ConversationsManager } from './components/ConversationsManager';
import { CampaignsManager } from './components/CampaignsManager';
import { AIManager } from './components/AIManager';
import { ResponsesManager } from './components/ResponsesManager';
import { Analytics } from './components/Analytics';
import { SettingsManager } from './components/SettingsManager';
import { LoginPage } from './components/LoginPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TriggerManager from './components/TriggerManager';


type TabType = 'dashboard' | 'conversations' | 'campaigns' | 'ai' | 'responses' | 'analytics' | 'settings' | 'trigger';

export default function App() {

  // ✅ Facebook Privacy Policy (Public - No Auth)
  if (window.location.pathname === '/privacy-policy') {
    return <PrivacyPolicy />;
  }

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      setIsAuthenticated(!!token);
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogin = (token: string) => {
    localStorage.setItem('authToken', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setActiveTab('dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const tabs = [
    { id: 'dashboard' as const, label: 'لوحة التحكم', icon: BarChart3 },
    { id: 'conversations' as const, label: 'المحادثات', icon: MessageSquare },
    { id: 'campaigns' as const, label: 'الحملات الإعلانية', icon: Megaphone },
    { id: 'responses' as const, label: 'الردود الجاهزة', icon: MessageCircle },
    { id: 'ai' as const, label: 'الذكاء الاصطناعي', icon: Bot },
    { id: 'analytics' as const, label: 'الإحصائيات', icon: BarChart3 },
    { id: 'settings' as const, label: 'الإعدادات', icon: Settings },
    { id: 'trigger' as const, label: 'Trigger Manager', icon: Bot },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900">نظام الردود الذكية</h1>
                <p className="text-sm text-gray-500">Messenger & Facebook</p>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-gray-600" onClick={handleLogout} />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-2 flex-wrap overflow-x-auto py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
        {activeTab === 'conversations' && <ConversationsManager />}
        {activeTab === 'campaigns' && <CampaignsManager />}
        {activeTab === 'responses' && <ResponsesManager />}
        {activeTab === 'ai' && <AIManager />}
        {activeTab === 'analytics' && <Analytics />}
        { activeTab === 'trigger' && <TriggerManager /> }  
        {activeTab === 'settings' && <SettingsManager onLogout={handleLogout} />}
        
      </main>
    </div>
  );
}
