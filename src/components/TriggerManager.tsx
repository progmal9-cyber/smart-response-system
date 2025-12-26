import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { toast } from "./ui/sonner";

/**
 * ✅ تعديل آمن
 * - رفع صورة أو فيديو من الجهاز
 * - بدون إرسال
 * - بدون كسر أي كود قديم
 */

type TriggerProduct = {
  id: string;
  label: string;
  response: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
};

type Trigger = {
  id: string;
  message: string;
  products: TriggerProduct[];
};

const TriggerManager: React.FC = () => {
  const [message, setMessage] = useState("");
  const [products, setProducts] = useState<TriggerProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [triggers, setTriggers] = useState<Trigger[]>([]);

  // منتج مؤقت
  const [productLabel, setProductLabel] = useState("");
  const [productResponse, setProductResponse] = useState("");
  const [productFile, setProductFile] = useState<File | null>(null);

  useEffect(() => {
    fetchTriggers();
  }, []);

  const fetchTriggers = async () => {
    try {
      const res = await fetch("/make-server-5c72f45a/triggers");
      const data = await res.json();
      setTriggers(data);
    } catch {
      toast("فشل تحميل Triggers");
    }
  };

  const addProduct = async () => {
    if (!productLabel || !productResponse) {
      toast("لازم اسم المنتج ونص الرد");
      return;
    }

    let mediaUrl: string | undefined;
    let mediaType: "image" | "video" | undefined;

    if (productFile) {
      const formData = new FormData();
      formData.append("file", productFile);

      const uploadRes = await fetch("/make-server-5c72f45a/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        toast("فشل رفع الملف");
        return;
      }

      const uploadData = await uploadRes.json();
      mediaUrl = uploadData.url;
      mediaType = productFile.type.startsWith("video")
        ? "video"
        : "image";
    }

    setProducts((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        label: productLabel,
        response: productResponse,
        mediaUrl,
        mediaType,
      },
    ]);

    setProductLabel("");
    setProductResponse("");
    setProductFile(null);
  };

  const removeProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSaveTrigger = async () => {
    if (!message || products.length === 0) {
      toast("الرسالة والمنتجات مطلوبة");
      return;
    }

    setLoading(true);

    try {
      await fetch("/make-server-5c72f45a/triggers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, products }),
      });

      toast("✅ تم حفظ Trigger");
      fetchTriggers();
      setMessage("");
      setProducts([]);
    } catch {
      toast("❌ فشل حفظ Trigger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>📩 رسالة Trigger</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="رسالة الترحيب أو العرض"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🛍️ منتج</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="اسم الزر"
            value={productLabel}
            onChange={(e) => setProductLabel(e.target.value)}
          />

          <Textarea
            placeholder="الرد عند الضغط"
            value={productResponse}
            onChange={(e) => setProductResponse(e.target.value)}
          />

          <Input
            type="file"
            accept="image/*,video/*"
            onChange={(e) =>
              setProductFile(e.target.files?.[0] || null)
            }
          />

          <Button onClick={addProduct}>➕ إضافة منتج</Button>

          {products.map((p) => (
            <div key={p.id} className="border p-2 rounded">
              {p.label} — {p.mediaType || "بدون ملف"}
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={handleSaveTrigger}>
        💾 حفظ Trigger
      </Button>
    </div>
  );
};

export default TriggerManager;
