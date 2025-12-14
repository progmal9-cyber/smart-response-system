import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4">سياسة الخصوصية</h1>
        <p className="mb-4">
          هذه الصفحة توضح كيفية جمع واستخدام وحماية المعلومات الشخصية لمستخدمي تطبيقنا "SheLooK.6".
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">1. المعلومات التي نقوم بجمعها</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>المعلومات التي تقدمها عند التسجيل أو التواصل معنا.</li>
          <li>المعلومات المتعلقة باستخدامك للتطبيق وخدمات Messenger.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">2. كيفية استخدام المعلومات</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>لتقديم خدمات الردود الذكية عبر Messenger.</li>
          <li>لتحسين تجربة المستخدم وتحليل الأداء.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">3. مشاركة المعلومات</h2>
        <p className="mb-4">
          لن نقوم ببيع أو مشاركة بياناتك الشخصية مع جهات خارجية إلا إذا كان ذلك مطلوبًا قانونيًا.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">4. حماية البيانات</h2>
        <p className="mb-4">
          نحن نتخذ التدابير التقنية والتنظيمية لحماية بياناتك من الوصول أو الاستخدام غير المصرح به.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">5. حقوق المستخدمين</h2>
        <p className="mb-4">
          يمكنك طلب حذف بياناتك في أي وقت عن طريق التواصل معنا على البريد الإلكتروني:
          <a href="mailto:most9276ali@gmail.com" className="text-blue-600 underline ml-1">most9276ali@gmail.com</a>
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">6. تحديثات سياسة الخصوصية</h2>
        <p className="mb-4">
          قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. أي تغييرات سيتم نشرها على هذه الصفحة.
        </p>

        <p className="mt-6 text-gray-500 text-sm">
          آخر تحديث: 14 ديسمبر 2025
        </p>
      </div>
    </div>
  );
}
