import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, TrendingUp, Users, MessageSquare, X, Image as ImageIcon } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ImageUploader } from './ImageUploader';

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed';
  conversions: number;
  impressions: number;
  createdAt: string;
  buttons: CampaignButton[];
  refKey?: string;
  linkedProduct?: string;
}

interface CampaignButton {
  id: string;
  label: string;
  response: string;
  imageUrl?: string;
}

export function CampaignsManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [products, setProducts] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active' as const,
    buttons: [] as CampaignButton[],
    refKey: '',
    linkedProduct: '',
  });

  useEffect(() => {
    fetchCampaigns();
    fetchProducts();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5c72f45a/campaigns`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCampaigns(data);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5c72f45a/products`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProducts(data.map((product: { name: string }) => product.name));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingCampaign
        ? `https://${projectId}.supabase.co/functions/v1/make-server-5c72f45a/campaigns/${editingCampaign.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-5c72f45a/campaigns`;

      const response = await fetch(url, {
        method: editingCampaign ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchCampaigns();
        setShowModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving campaign:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الحملة؟')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5c72f45a/campaigns/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        await fetchCampaigns();
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      status: 'active',
      buttons: [],
      refKey: '',
      linkedProduct: '',
    });
    setEditingCampaign(null);
  };

  const openEditModal = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      description: campaign.description,
      status: campaign.status,
      buttons: campaign.buttons,
      refKey: campaign.refKey || '',
      linkedProduct: campaign.linkedProduct || '',
    });
    setShowModal(true);
  };

  const addButton = () => {
    setFormData({
      ...formData,
      buttons: [
        ...formData.buttons,
        { id: Date.now().toString(), label: '', response: '' },
      ],
    });
  };

  const updateButton = (index: number, field: 'label' | 'response' | 'imageUrl', value: string) => {
    const newButtons = [...formData.buttons];
    newButtons[index] = { ...newButtons[index], [field]: value };
    setFormData({ ...formData, buttons: newButtons });
  };

  const removeButton = (index: number) => {
    setFormData({
      ...formData,
      buttons: formData.buttons.filter((_, i) => i !== index),
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'paused':
        return 'bg-yellow-100 text-yellow-700';
      case 'completed':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'paused':
        return 'متوقف';
      case 'completed':
        return 'مكتمل';
      default:
        return status;
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
      <div className="flex items-center justify-between">
        <h2 className="text-gray-900">الحملات الإعلانية</h2>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>حملة جديدة</span>
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-gray-900 mb-1">{campaign.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{campaign.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(campaign)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => handleDelete(campaign.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>

            {/* Status */}
            <div className="mb-4">
              <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(campaign.status)}`}>
                {getStatusLabel(campaign.status)}
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">المحادثات</span>
                </div>
                <div className="text-gray-900">{campaign.conversions}</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-purple-600 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">المشاهدات</span>
                </div>
                <div className="text-gray-900">{campaign.impressions}</div>
              </div>
            </div>

            {/* Buttons */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm text-gray-600 mb-2">الأزرار ({campaign.buttons.length})</p>
              <div className="flex flex-wrap gap-2">
                {campaign.buttons.slice(0, 3).map((button) => (
                  <span
                    key={button.id}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {button.label}
                  </span>
                ))}
                {campaign.buttons.length > 3 && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    +{campaign.buttons.length - 3}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {campaigns.length === 0 && (
          <div className="col-span-full bg-white rounded-xl p-12 text-center border border-gray-100">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">لا توجد حملات إعلانية</p>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>إنشاء أول حملة</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h3 className="text-gray-900">
                {editingCampaign ? 'تعديل الحملة' : 'حملة جديدة'}
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
              {/* Name */}
              <div>
                <label className="block text-gray-700 mb-2">اسم الحملة</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  placeholder="مثال: العرض الصيفي"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-700 mb-2">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="وصف مختصر للحملة..."
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-gray-700 mb-2">الحالة</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">نشط</option>
                  <option value="paused">متوقف</option>
                  <option value="completed">مكتمل</option>
                </select>
              </div>

              {/* Ref Key */}
              <div>
                <label className="block text-gray-700 mb-2">مفتاح المرجع (اختياري)</label>
                <input
                  type="text"
                  value={formData.refKey}
                  onChange={(e) => setFormData({ ...formData, refKey: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="مثال: ref123"
                />
              </div>

              {/* Linked Product */}
              <div>
                <label className="block text-gray-700 mb-2">المنتج المرتبط (اختياري)</label>
                <select
                  value={formData.linkedProduct}
                  onChange={(e) => setFormData({ ...formData, linkedProduct: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">بدون منتج مرتبط</option>
                  {products.map((product) => (
                    <option key={product} value={product}>
                      {product}
                    </option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-gray-700">أزرار الردود</label>
                  <button
                    type="button"
                    onClick={addButton}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة زر</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.buttons.map((button, index) => (
                    <div key={button.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-sm text-gray-600">زر {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeButton(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={button.label}
                          onChange={(e) => updateButton(index, 'label', e.target.value)}
                          placeholder="نص الزر (مثال: السعر)"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                        <textarea
                          value={button.response}
                          onChange={(e) => updateButton(index, 'response', e.target.value)}
                          placeholder="الرد التلقائي عند الضغط على هذا الزر..."
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={2}
                          required
                        />
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-gray-600" />
                          <ImageUploader
                            onImageUploaded={(imageUrl) => updateButton(index, 'imageUrl', imageUrl)}
                            currentImage={button.imageUrl}
                            label="صورة مرفقة مع الرد (اختياري)"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg hover:shadow-lg transition-all"
                >
                  {editingCampaign ? 'حفظ التغييرات' : 'إنشاء الحملة'}
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