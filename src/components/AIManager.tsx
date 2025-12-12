import React, { useState, useEffect } from 'react';
import { Bot, Plus, Trash2, Save, AlertCircle, BookOpen, Settings as SettingsIcon } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface KnowledgeItem {
  id: string;
  category: string;
  content: string;
  createdAt: string;
  productName?: string;
}

interface AISettings {
  enabled: boolean;
  model: string;
  temperature: number;
  allowedTopics: string[];
  restrictedTopics: string[];
}

export function AIManager() {
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeItem[]>([]);
  const [settings, setSettings] = useState<AISettings>({
    enabled: true,
    model: 'gpt-4',
    temperature: 0.7,
    allowedTopics: [],
    restrictedTopics: [],
  });
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ category: '', content: '', productName: '' });
  const [newAllowedTopic, setNewAllowedTopic] = useState('');
  const [newRestrictedTopic, setNewRestrictedTopic] = useState('');

  const categories = [
    { value: 'pricing', label: 'الأسعار والتكاليف' },
    { value: 'products', label: 'المنتجات والمواصفات' },
    { value: 'shipping', label: 'الشحن والتوصيل' },
    { value: 'returns', label: 'الإرجاع والاستبدال' },
    { value: 'payment', label: 'طرق الدفع' },
    { value: 'policies', label: 'السياسات والشروط' },
    { value: 'marketing', label: 'الردود التسويقية' },
    { value: 'support', label: 'الدعم الفني' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch knowledge base
      const kbResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5c72f45a/ai/knowledge`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (kbResponse.ok) {
        const kbData = await kbResponse.json();
        setKnowledgeBase(kbData);
      }

      // Fetch AI settings
      const settingsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5c72f45a/ai/settings`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        setSettings(settingsData);
      }
    } catch (error) {
      console.error('Error fetching AI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addKnowledgeItem = async () => {
    if (!newItem.category || !newItem.content) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5c72f45a/ai/knowledge`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newItem),
        }
      );

      if (response.ok) {
        await fetchData();
        setNewItem({ category: '', content: '', productName: '' });
      }
    } catch (error) {
      console.error('Error adding knowledge item:', error);
    }
  };

  const deleteKnowledgeItem = async (id: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5c72f45a/ai/knowledge/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error deleting knowledge item:', error);
    }
  };

  const saveSettings = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5c72f45a/ai/settings`,
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
        alert('تم حفظ الإعدادات بنجاح');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const addAllowedTopic = () => {
    if (!newAllowedTopic) return;
    setSettings({
      ...settings,
      allowedTopics: [...settings.allowedTopics, newAllowedTopic],
    });
    setNewAllowedTopic('');
  };

  const removeAllowedTopic = (topic: string) => {
    setSettings({
      ...settings,
      allowedTopics: settings.allowedTopics.filter(t => t !== topic),
    });
  };

  const addRestrictedTopic = () => {
    if (!newRestrictedTopic) return;
    setSettings({
      ...settings,
      restrictedTopics: [...settings.restrictedTopics, newRestrictedTopic],
    });
    setNewRestrictedTopic('');
  };

  const removeRestrictedTopic = (topic: string) => {
    setSettings({
      ...settings,
      restrictedTopics: settings.restrictedTopics.filter(t => t !== topic),
    });
  };

  const getCategoryLabel = (category: string) => {
    return categories.find(c => c.value === category)?.label || category;
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
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-gray-900">إدارة الذكاء الاصطناعي</h2>
          <p className="text-gray-600">قاعدة المعلومات والإعدادات</p>
        </div>
      </div>

      {/* AI Settings */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <SettingsIcon className="w-5 h-5 text-gray-700" />
          <h3 className="text-gray-900">إعدادات الذكاء الاصطناعي</h3>
        </div>

        <div className="space-y-6">
          {/* Model Selection */}
          <div>
            <label className="block text-gray-700 mb-2">نموذج الذكاء الاصطناعي</label>
            <select
              value={settings.model}
              onChange={(e) => setSettings({ ...settings, model: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="gpt-4">GPT-4 (الأكثر دقة)</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo (أسرع وأرخص)</option>
            </select>
          </div>

          {/* Temperature */}
          <div>
            <label className="block text-gray-700 mb-2">
              درجة الإبداع (Temperature): {settings.temperature}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.temperature}
              onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
              className="w-full"
            />
            <p className="text-sm text-gray-500 mt-1">
              0 = ردود متطابقة ومباشرة، 1 = ردود إبداعية ومتنوعة
            </p>
          </div>

          {/* Allowed Topics */}
          <div>
            <label className="block text-gray-700 mb-2">المواضيع المسموح بالرد عليها</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newAllowedTopic}
                onChange={(e) => setNewAllowedTopic(e.target.value)}
                placeholder="أضف موضوع جديد..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllowedTopic())}
              />
              <button
                onClick={addAllowedTopic}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {settings.allowedTopics.map((topic, index) => (
                <span
                  key={index}
                  className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full"
                >
                  {topic}
                  <button onClick={() => removeAllowedTopic(topic)}>
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {settings.allowedTopics.length === 0 && (
                <p className="text-gray-500 text-sm">لم يتم تحديد مواضيع - سيرد AI على جميع الأسئلة</p>
              )}
            </div>
          </div>

          {/* Restricted Topics */}
          <div>
            <label className="block text-gray-700 mb-2">المواضيع الممنوع الرد عليها</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newRestrictedTopic}
                onChange={(e) => setNewRestrictedTopic(e.target.value)}
                placeholder="أضف موضوع ممنوع..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRestrictedTopic())}
              />
              <button
                onClick={addRestrictedTopic}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {settings.restrictedTopics.map((topic, index) => (
                <span
                  key={index}
                  className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full"
                >
                  {topic}
                  <button onClick={() => removeRestrictedTopic(topic)}>
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {settings.restrictedTopics.length === 0 && (
                <p className="text-gray-500 text-sm">لا توجد مواضيع محظورة</p>
              )}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={saveSettings}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
          >
            <Save className="w-5 h-5" />
            <span>حفظ الإعدادات</span>
          </button>
        </div>
      </div>

      {/* Knowledge Base */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="w-5 h-5 text-gray-700" />
          <h3 className="text-gray-900">قاعدة المعلومات</h3>
        </div>

        {/* Add New Knowledge */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
          <h4 className="text-gray-900 mb-4">إضافة معلومات جديدة</h4>
          <div className="space-y-4">
            <input
              type="text"
              value={newItem.productName}
              onChange={(e) => setNewItem({ ...newItem, productName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              placeholder="اسم المنتج (اختياري - للربط بالحملات)"
            />

            <select
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">اختر الفئة...</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            <textarea
              value={newItem.content}
              onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
              placeholder="اكتب المعلومات التي سيستخدمها الذكاء الاصطناعي في الردود...&#10;&#10;مثال:&#10;- سعر المنتج الأساسي: 299 ريال&#10;- الشحن مجاني للطلبات فوق 500 ريال&#10;- مدة التوصيل 3-5 أيام عمل"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              rows={6}
            />

            <button
              onClick={addKnowledgeItem}
              disabled={!newItem.category || !newItem.content}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
              <span>إضافة إلى قاعدة المعلومات</span>
            </button>
          </div>
        </div>

        {/* Knowledge Items */}
        <div className="space-y-4">
          {knowledgeBase.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                قاعدة المعلومات فارغة. أضف معلومات ليستخدمها الذكاء الاصطناعي في الردود.
              </p>
            </div>
          ) : (
            knowledgeBase.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {getCategoryLabel(item.category)}
                      </span>
                      {item.productName && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                          📦 {item.productName}
                        </span>
                      )}
                      <span className="text-sm text-gray-500">{item.createdAt}</span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{item.content}</p>
                  </div>
                  <button
                    onClick={() => deleteKnowledgeItem(item.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1" />
          <div>
            <h4 className="mb-2">ملاحظة مهمة</h4>
            <p className="text-white/90 leading-relaxed">
              يستخدم الذكاء الاصطناعي المعلومات الموجودة في قاعدة البيانات للرد على استفسارات العملاء.
              تأكد من إضافة معلومات دقيقة وشاملة عن منتجاتك وخدماتك لضمان ردود احترافية ومفيدة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}