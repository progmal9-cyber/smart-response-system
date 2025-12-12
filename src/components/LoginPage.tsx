import React, { useState } from 'react';
import { MessageSquare, Mail, Lock, UserPlus, LogIn } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface LoginPageProps {
  onLogin: (token: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isSignup ? 'signup' : 'login';
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5c72f45a/${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        onLogin(data.token);
      } else {
        const error = await response.json();
        alert(error.error || 'فشل تسجيل الدخول');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('حدث خطأ. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-gray-900 mb-2">نظام الردود الذكية</h1>
          <p className="text-gray-600">Messenger & Facebook</p>
        </div>

        {/* Login/Signup Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="mb-6">
            <h2 className="text-gray-900 mb-2">
              {isSignup ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
            </h2>
            <p className="text-gray-600">
              {isSignup
                ? 'أدخل بياناتك لإنشاء حساب'
                : 'أدخل بريدك الإلكتروني وكلمة المرور'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name (only for signup) */}
            {isSignup && (
              <div>
                <label className="block text-gray-700 mb-2">الاسم</label>
                <div className="relative">
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <UserPlus className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أدخل اسمك"
                    required={isSignup}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-gray-700 mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="example@email.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 mb-2">كلمة المرور</label>
              <div className="relative">
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              {isSignup && (
                <p className="text-sm text-gray-500 mt-2">يجب أن تكون 6 أحرف على الأقل</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  {isSignup ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                  <span>{isSignup ? 'إنشاء الحساب' : 'تسجيل الدخول'}</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle between login and signup */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setFormData({ name: '', email: '', password: '' });
              }}
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              {isSignup ? 'لديك حساب بالفعل؟ سجّل الدخول' : 'ليس لديك حساب؟ أنشئ حساب جديد'}
            </button>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-gray-700 mb-2">
            <strong>للتجربة السريعة:</strong>
          </p>
          <p className="text-sm text-gray-600">
            البريد: demo@example.com<br />
            كلمة المرور: demo123
          </p>
        </div>
      </div>
    </div>
  );
}
