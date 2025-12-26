import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { toast } from "./ui/sonner";

/**
 * ⚠️ ملاحظة مهمة
 * الملف ده مستقل تمامًا
 * مفيش أي تعديل على كود قديم
 */

type TriggerProduct = {
  id: string;
  label: string;
  response: string;
  imageUrl?: string;
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

  // منتج مؤقت أثناء الإضافة
  const [productLabel, setProductLabel] = useState("");
  const [productResponse, setProductResponse] = useState("");
  const [productImage, setProductImage] = useState("");

  const addProduct = () => {
    if (!productLabel || !productResponse) {
      toast("لازم اسم المنتج ونص الرد");
      return;
    }

    setProducts((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        label: productLabel,
        response: productResponse,
        imageUrl: productImage || undefined,
      },
    ]);

    setProductLabel("");
    setProductResponse("");
    setProductImage("");
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

    /**
     * ⛔ موقوف حاليًا
     * هنا بس بنجهّز الداتا
     * الربط مع الباك إند هنعمله بعدين خطوة خطوة
     */
    const payload: Trigger = {
      id: Date.now().toString(),
      message,
      products,
    };

    console.log("Trigger Payload (SAFE):", payload);

    toast("تم حفظ الـ Trigger (محليًا)");

    setLoading(false);
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>📩 رسالة Trigger (مفتوحة)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="أهلًا 👋 نزل عندنا منتجات جديدة تناسب اختياراتك السابقة..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🛍️ أزرار المنتجات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <Input
              placeholder="اسم المنتج (زر)"
              value={productLabel}
              onChange={(e) => setProductLabel(e.target.value)}
            />

            <Textarea
              placeholder="نص الرد عند الضغط"
              value={productResponse}
              onChange={(e) => setProductResponse(e.target.value)}
            />

            <Input
              placeholder="رابط صورة المنتج (اختياري)"
              value={productImage}
              onChange={(e) => setProductImage(e.target.value)}
            />

            <Button onClick={addProduct}>➕ إضافة منتج</Button>
          </div>

          {products.length > 0 && (
            <div className="mt-4 space-y-2">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between border p-3 rounded"
                >
                  <div>
                    <div className="font-semibold">{p.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {p.response}
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeProduct(p.id)}
                  >
                    حذف
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Button disabled={loading} onClick={handleSaveTrigger}>
        💾 حفظ Trigger
      </Button>
    </div>
  );
};

export default TriggerManager;
