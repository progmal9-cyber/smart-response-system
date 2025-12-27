import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Textarea } from "../components/ui/textarea"
import { Input } from "../components/ui/input"
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

type FacebookPost = {
  id: string
  message?: string
  created_time: string
}

export default function FacebookPosts() {
  const [posts, setPosts] = useState<FacebookPost[]>([])
  const [loading, setLoading] = useState(false)
  const [savingPost, setSavingPost] = useState<string | null>(null)

  // states لكل بوست
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({})
  const [privateMessages, setPrivateMessages] = useState<Record<string, string>>({})
  const [imageFiles, setImageFiles] = useState<Record<string, File | null>>({})
  const [imageUrls, setImageUrls] = useState<Record<string, string | null>>({})

  // حالة التفعيل
  const [enabledPosts, setEnabledPosts] = useState<Record<string, boolean>>({})

  // ----------------------------
  // جلب المنشورات + الحالات
  // ----------------------------
  useEffect(() => {
    fetchPosts()
    fetchTriggers()
  }, [])

const fetchPosts = async () => {
  try {
    setLoading(true)
    const res = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-5c72f45a/facebook/posts`,
      {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      }
    )

    if (!res.ok) throw new Error()

    const data: { success: boolean; posts: FacebookPost[] } = await res.json()
    setPosts(data.posts || [])
  } catch (error) {
    console.error(error)
    alert("حصل خطأ أثناء تحميل المنشورات")
  } finally {
    setLoading(false)
  }
}

  const fetchTriggers = async () => {
    const { data, error } = await supabase
      .from("post_triggers")
      .select("post_id, enabled")

    if (error || !data) return

    const map: Record<string, boolean> = {}
    data.forEach((t) => {
      map[t.post_id] = t.enabled
    })

    setEnabledPosts(map)
  }

  // ----------------------------
  // رفع الصورة
  // ----------------------------
  const uploadImage = async (postId: string) => {
    const file = imageFiles[postId]
    if (!file) return null

    const fileName = `fb-replies/${postId}-${Date.now()}-${file.name}`

    const { error } = await supabase.storage
      .from("campaign-images")
      .upload(fileName, file, { cacheControl: "3600", upsert: true })

    if (error) {
      alert("فشل رفع الصورة")
      return null
    }

    const { data } = supabase.storage
      .from("campaign-images")
      .getPublicUrl(fileName)

    return data.publicUrl
  }

  // ----------------------------
  // حفظ (UPSERT)
  // ----------------------------
  const saveTrigger = async (postId: string) => {
    const replyText = replyTexts[postId] || ""
    const privateMessage = privateMessages[postId] || ""
    const imageFile = imageFiles[postId]

    if (!replyText && !privateMessage && !imageFile) {
      alert("لازم تدخل رد أو رسالة أو صورة")
      return
    }

    setSavingPost(postId)

    let uploadedImageUrl = imageUrls[postId] || null

    if (imageFile && !uploadedImageUrl) {
      uploadedImageUrl = await uploadImage(postId)
      setImageUrls((prev) => ({ ...prev, [postId]: uploadedImageUrl }))
    }

    const { error } = await supabase
      .from("post_triggers")
      .upsert(
        {
          post_id: postId,
          auto_comment_text: replyText,
          private_message: privateMessage,
          image_url: uploadedImageUrl,
          enabled: true,
        },
        { onConflict: "post_id" }
      )

    if (error) {
      alert("حصل خطأ أثناء الحفظ")
    } else {
      alert("تم تفعيل الرد التلقائي ✅")

      setEnabledPosts((prev) => ({ ...prev, [postId]: true }))
      setReplyTexts((prev) => ({ ...prev, [postId]: "" }))
      setPrivateMessages((prev) => ({ ...prev, [postId]: "" }))
      setImageFiles((prev) => ({ ...prev, [postId]: null }))
      setImageUrls((prev) => ({ ...prev, [postId]: null }))
    }

    setSavingPost(null)
  }

  // ----------------------------
  // UI
  // ----------------------------
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">📘 منشورات صفحة Facebook</h2>

      {loading && <p>جاري تحميل المنشورات...</p>}

      {posts.map((post) => (
        <Card key={post.id}>
          <CardHeader className="flex justify-between">
            <CardTitle>منشور</CardTitle>

            {enabledPosts[post.id] ? (
              <span className="text-green-600 text-sm">🟢 مفعل</span>
            ) : (
              <span className="text-red-600 text-sm">🔴 غير مفعل</span>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {post.message || "منشور بدون نص"}
            </p>

            <Textarea
              placeholder="💬 رد التعليق (عام)"
              value={replyTexts[post.id] || ""}
              onChange={(e) =>
                setReplyTexts((prev) => ({ ...prev, [post.id]: e.target.value }))
              }
            />

            <Textarea
              placeholder="📩 الرسالة الخاصة"
              value={privateMessages[post.id] || ""}
              onChange={(e) =>
                setPrivateMessages((prev) => ({ ...prev, [post.id]: e.target.value }))
              }
            />

            <Input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setImageFiles((prev) => ({ ...prev, [post.id]: e.target.files?.[0] || null }))
              }
            />

            <Button
              onClick={() => saveTrigger(post.id)}
              disabled={savingPost === post.id}
            >
              {savingPost === post.id
                ? "جاري الحفظ..."
                : "✅ تفعيل الرد التلقائي"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
