import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MessageCircle, X, Search } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ImageUploader } from './ImageUploader';

interface Response {
  id: string;
  trigger: string;
  message: string;
  category: string;
  createdAt: string;
  imageUrl?: string;
}

export function ResponsesManager() {
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingResponse, setEditingResponse] = useState<Response | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [formData, setFormData] = useState({
    trigger: '',
    message: '',
    category: 'general',
    imageUrl: '',
  });

  const categories = [
    { value: 'general', label: 'عام' },
    { value: 'pricing', label: 'الأسعار' },
    { value: 'shipping', label: 'الشحن' },
    { value: 'returns', label: 'الإرجاع والاستبدال' },
    { value: 'products', label: 'المنتجات' },
    { value: 'support', label: 'الدعم الفني' },
  ];

  useEffect(() => {
    fetchResponses();
  }, []);

  const fetchResponses = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5c72f45a/responses`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setResponses(data);
      }
    } catch (error) {
      console.error('Error fetching responses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingResponse
        ? `https://${projectId}.supabase.co/functions/v1/make-server-5c72f45a/responses/${editingResponse.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-5c72f45a/responses`;

      const response = await fetch(url, {
        method: editingResponse ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchResponses();
        setShowModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving response:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الرد؟')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5c72f45a/responses/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        await fetchResponses();
      }
    } catch (error) {
      console.error('Error deleting response:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      trigger: '',
      message: '',
      category: 'general',
      imageUrl: '',
    });
    setEditingResponse(null);
  };

  const openEditModal = (response: Response) => {
    setEditingResponse(response);
    setFormData({
      trigger: response.trigger,
      message: response.message,
      category: response.category,
      imageUrl: response.imageUrl || '',
    });
    setShowModal(true);
  };

  const filteredResponses = responses.filter(resp => {
    const matchesSearch = resp.trigger.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resp.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || resp.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryLabel = (category: string) => {
    return categories.find(c => c.value === category)?.label || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      general: 'bg-gray-100 text-gray-700',
      pricing: 'bg-green-100 text-green-700',
      shipping: 'bg-blue-100 text-blue-700',
      returns: 'bg-orange-100 text-orange-700',
      products: 'bg-purple-100 text-purple-700',
      support: 'bg-red-100 text-red-700',
    };
    return colors[category] || colors.general;
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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-gray-900">الردود الجاهزة</h2>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>رد جديد</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="البحث في الردود..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">جميع الفئات</option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Responses List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredResponses.map((response) => (
          <div
            key={response.id}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${getCategoryColor(response.category)}`}>
                    {getCategoryLabel(response.category)}
                  </span>
                </div>
                <h4 className="text-gray-900 mb-2">
                  {response.trigger}
                </h4>
                <p className="text-gray-600 line-clamp-3">{response.message}</p>
                {response.imageUrl && (
                  <img
                    src={response.imageUrl}
                    alt="Response Image"
                    className="mt-2 max-w-full h-auto"
                  />
                )}
              </div>
              <div className="flex gap-2 mr-4">
                <button
                  onClick={() => openEditModal(response)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => handleDelete(response.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredResponses.length === 0 && (
          <div className="col-span-full bg-white rounded-xl p-12 text-center border border-gray-100">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">لا توجد ردود جاهزة</p>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>إضافة أول رد</span>
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-600 mb-1">إجمالي الردود</p>
          <div className="text-gray-900">{responses.length}</div>
        </div>
        {categories.slice(0, 3).map((cat) => (
          <div key={cat.value} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-gray-600 mb-1">{cat.label}</p>
            <div className="text-gray-900">
              {responses.filter(r => r.category === cat.value).length}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="border-b border-gray-200 p-6 flex items-center justify-between">
              <h3 className="text-gray-900">
                {editingResponse ? 'تعديل الرد' : 'رد جديد'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Category */}
              <div>
                <label className="block text-gray-700 mb-2">الفئة</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Trigger */}
              <div>
                <label className="block text-gray-700 mb-2">العبارة المفتاحية / السؤال</label>
                <input
                  type="text"
                  value={formData.trigger}
                  onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  placeholder="مثال: ما هي الأسعار؟"
                />
                <p className="text-sm text-gray-500 mt-2">
                  العبارة التي ستظهر كزر أو تُستخدم للبحث عن الرد المناسب
                </p>
              </div>

              {/* Message */}
              <div>
                <label className="block text-gray-700 mb-2">الرد التلقائي</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={6}
                  required
                  placeholder="اكتب الرد الذي سيتم إرساله للعميل..."
                />
              </div>

              {/* Image */}
              <div>
                <ImageUploader
                  onImageUploaded={(url) => setFormData({ ...formData, imageUrl: url })}
                  currentImage={formData.imageUrl}
                  label="صورة مرفقة مع الرد (اختياري)"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg hover:shadow-lg transition-all"
                >
                  {editingResponse ? 'حفظ التغييرات' : 'إضافة الرد'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}