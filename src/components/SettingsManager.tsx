import React, { useState, useEffect } from 'react';
import { Key, Save, Eye, EyeOff, Facebook, Sparkles, CheckCircle, AlertCircle, LogOut } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface APISettings {
  facebookPageAccessToken: string;
  facebookPageId: string;
  facebookVerifyToken: string;
  openaiApiKey: string;
}

interface SettingsManagerProps {
  onLogout: () => void;
}

export function SettingsManager({ onLogout }: SettingsManagerProps) {
  const [settings, setSettings] = useState<APISettings>({
    facebookPageAccessToken: '',
    facebookPageId: '',
    facebookVerifyToken: '',
    openaiApiKey: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showTokens, setShowTokens] = useState({
    facebook: false,
    openai: false,
  });
  const [testingConnection, setTestingConnection] = useState({
    facebook: false,
    openai: false,
  });
  const [connectionStatus, setConnectionStatus] = useState({
    facebook: null as boolean | null,
    openai: null as boolean | null,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5c72f45a/settings`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5c72f45a/settings`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(settings),
        }
      );

      if (response.ok) {
        alert('تم حفظ الإعدادات بنجاح!');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('فشل حفظ الإعدادات. يرجى المحاولة مرة أخرى.');
    } finally {
      setSaving(false);
    }
  };

  const testFacebookConnection = async () => {
    if (!settings.facebookPageAccessToken || !settings.facebookPageId) {
      alert('يرجى إدخال Page Access Token و Page ID أولاً');
      return;
    }

    setTestingConnection({ ...testingConnection, facebook: true });
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5c72f45a/test-facebook`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pageAccessToken: settings.facebookPageAccessToken,
            pageId: settings.facebookPageId,
          }),
        }
      );

      const result = await response.json();
      setConnectionStatus({ ...connectionStatus, facebook: result.success });
      
      if (result.success) {
        alert(`✅ تم الاتصال بنجاح!\nاسم الصفحة: ${result.pageName}`);
      } else {
        alert(`❌ فشل الاتصال: ${result.error}`);
      }
    } catch (error) {
      console.error('Error testing Facebook connection:', error);
      setConnectionStatus({ ...connectionStatus, facebook: false });
      alert('فشل اختبار الاتصال');
    } finally {
      setTestingConnection({ ...testingConnection, facebook: false });
    }
  };

  const testOpenAIConnection = async () => {
    if (!settings.openaiApiKey) {
      alert('يرجى إدخال OpenAI API Key أولاً');
      return;
    }

    setTestingConnection({ ...testingConnection, openai: true });
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5c72f45a/test-openai`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            apiKey: settings.openaiApiKey,
          }),
        }
      );

      const result = await response.json();
      setConnectionStatus({ ...connectionStatus, openai: result.success });
      
      if (result.success) {
        alert('✅ تم الاتصال بـ OpenAI بنجاح!');
      } else {
        alert(`❌ فشل الاتصال: ${result.error}`);
      }
    } catch (error) {
      console.error('Error testing OpenAI connection:', error);
      setConnectionStatus({ ...connectionStatus, openai: false });
      alert('فشل اختبار الاتصال');
    } finally {
      setTestingConnection({ ...testingConnection, openai: false });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl">
          <Key className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-gray-900">إعدادات API</h2>
          <p className="text-gray-600">ربط Facebook Graph API و OpenAI</p>
        </div>
      </div>

      {/* Facebook Settings */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Facebook className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-gray-900">Facebook Graph API</h3>
            <p className="text-sm text-gray-600">للاتصال بصفحات Facebook و Messenger</p>
          </div>
          {connectionStatus.facebook !== null && (
            connectionStatus.facebook ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-500" />
            )
          )}
        </div>

        <div className="space-y-4">
          {/* Page Access Token */}
          <div>
            <label className="block text-gray-700 mb-2">Page Access Token</label>
            <div className="relative">
              <input
                type={showTokens.facebook ? 'text' : 'password'}
                value={settings.facebookPageAccessToken}
                onChange={(e) => setSettings({ ...settings, facebookPageAccessToken: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-12"
                placeholder="EAAxxxxxxxxxxxxxxxxxxxxx..."
              />
              <button
                type="button"
                onClick={() => setShowTokens({ ...showTokens, facebook: !showTokens.facebook })}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showTokens.facebook ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              احصل عليه من: <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Graph API Explorer</a>
            </p>
          </div>

          {/* Page ID */}
          <div>
            <label className="block text-gray-700 mb-2">Page ID</label>
            <input
              type="text"
              value={settings.facebookPageId}
              onChange={(e) => setSettings({ ...settings, facebookPageId: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="123456789012345"
            />
            <p className="text-sm text-gray-500 mt-2">
              رقم تعريف صفحة Facebook الخاصة بك
            </p>
          </div>

          {/* Verify Token */}
          <div>
            <label className="block text-gray-700 mb-2">Verify Token (للـ Webhook)</label>
            <input
              type="text"
              value={settings.facebookVerifyToken}
              onChange={(e) => setSettings({ ...settings, facebookVerifyToken: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="my_custom_verify_token_123"
            />
            <p className="text-sm text-gray-500 mt-2">
              رمز مخصص لتأمين Webhook - اختر أي نص تريده
            </p>
          </div>

          {/* Test Connection */}
          <button
            onClick={testFacebookConnection}
            disabled={testingConnection.facebook}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testingConnection.facebook ? 'جاري الاختبار...' : 'اختبار الاتصال'}
          </button>
        </div>

        {/* Setup Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-gray-900 mb-2">خطوات الإعداد:</h4>
          <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
            <li>انتقل إلى <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Facebook Developers</a></li>
            <li>أنشئ تطبيق جديد أو استخدم تطبيق موجود</li>
            <li>أضف منتج "Messenger" لتطبيقك</li>
            <li>احصل على Page Access Token من Graph API Explorer</li>
            <li>أضف Webhook URL: <code className="bg-white px-2 py-1 rounded text-xs">{`https://${projectId}.supabase.co/functions/v1/make-server-5c72f45a/webhook`}</code></li>
            <li>اشترك في أحداث: messages، messaging_postbacks</li>
          </ol>
        </div>
      </div>

      {/* OpenAI Settings */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-gray-900">OpenAI API</h3>
            <p className="text-sm text-gray-600">للردود الذكية باستخدام GPT</p>
          </div>
          {connectionStatus.openai !== null && (
            connectionStatus.openai ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-500" />
            )
          )}
        </div>

        <div className="space-y-4">
          {/* API Key */}
          <div>
            <label className="block text-gray-700 mb-2">OpenAI API Key</label>
            <div className="relative">
              <input
                type={showTokens.openai ? 'text' : 'password'}
                value={settings.openaiApiKey}
                onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pl-12"
                placeholder="sk-xxxxxxxxxxxxxxxxxxxxx..."
              />
              <button
                type="button"
                onClick={() => setShowTokens({ ...showTokens, openai: !showTokens.openai })}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showTokens.openai ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              احصل عليه من: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">OpenAI API Keys</a>
            </p>
          </div>

          {/* Test Connection */}
          <button
            onClick={testOpenAIConnection}
            disabled={testingConnection.openai}
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testingConnection.openai ? 'جاري الاختبار...' : 'اختبار الاتصال'}
          </button>
        </div>

        {/* Setup Instructions */}
        <div className="mt-6 p-4 bg-purple-50 rounded-lg">
          <h4 className="text-gray-900 mb-2">خطوات الإعداد:</h4>
          <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
            <li>انتقل إلى <a href="https://platform.openai.com/signup" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">OpenAI Platform</a></li>
            <li>أنشئ حساب جديد أو سجّل الدخول</li>
            <li>اذهب إلى API Keys في إعدادات الحساب</li>
            <li>أنشئ مفتاح API جديد وانسخه</li>
            <li>تأكد من إضافة رصيد إلى حسابك لاستخدام API</li>
          </ol>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'جاري الحفظ...' : 'حفظ جميع الإعدادات'}</span>
        </button>
      </div>

      {/* Security Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-gray-900 mb-1">ملاحظة أمنية مهمة</h4>
            <p className="text-sm text-gray-700">
              يتم تخزين مفاتيح API بشكل آمن في قاعدة البيانات. لا تشارك هذه المفاتيح مع أي شخص.
              تأكد من استخدام Page Access Token مع الصلاحيات المناسبة فقط.
            </p>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="flex gap-4">
        <button
          onClick={onLogout}
          className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-4 rounded-lg hover:bg-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
}