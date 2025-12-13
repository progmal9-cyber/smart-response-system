import { Hono } from 'npm:hono@4';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Create Supabase client for Storage
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Initialize storage bucket
const initStorage = async () => {
  const bucketName = 'make-5c72f45a-images';
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, { public: false });
      console.log(`Created bucket: ${bucketName}`);
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};
initStorage();

// ============= AUTH ENDPOINTS =============
app.post('/signup', async (c) => {
  try {
    const { name, email, password } = await c.req.json();

    // Check if user already exists
    const existingUser = await kv.get(`user:${email}`);
    if (existingUser) {
      return c.json({ error: 'المستخدم موجود بالفعل' }, 400);
    }

    // Create user
    const user = {
      id: Date.now().toString(),
      name,
      email,
      password, // In production, hash this!
      createdAt: new Date().toISOString(),
    };

    await kv.set(`user:${email}`, user);

    // Create token (simple demo token)
    const token = `token_${user.id}_${Date.now()}`;
    await kv.set(`token:${token}`, user.id);

    return c.json({ success: true, token, user: { id: user.id, name, email } });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'فشل إنشاء الحساب' }, 500);
  }
});

app.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    // Check demo credentials
    if (email === 'demo@example.com' && password === 'demo123') {
      const token = `token_demo_${Date.now()}`;
      return c.json({
        success: true,
        token,
        user: { id: 'demo', name: 'Demo User', email: 'demo@example.com' },
      });
    }

    const user = await kv.get(`user:${email}`);
    if (!user || user.password !== password) {
      return c.json({ error: 'بيانات تسجيل الدخول غير صحيحة' }, 401);
    }

    // Create token
    const token = `token_${user.id}_${Date.now()}`;
    await kv.set(`token:${token}`, user.id);

    return c.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'فشل تسجيل الدخول' }, 500);
  }
});

// ============= IMAGE UPLOAD ENDPOINT =============
app.post('/upload-image', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Generate unique filename
    const filename = `${Date.now()}_${file.name}`;
    const bucketName = 'make-5c72f45a-images';

    // Upload to Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filename, arrayBuffer, {
        contentType: file.type,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return c.json({ error: 'Failed to upload image' }, 500);
    }

    // Get signed URL (valid for 10 years)
    const { data: signedUrlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filename, 315360000);

    if (!signedUrlData) {
      return c.json({ error: 'Failed to create signed URL' }, 500);
    }

    return c.json({ url: signedUrlData.signedUrl });
  } catch (error) {
    console.error('Image upload error:', error);
    return c.json({ error: 'Failed to upload image' }, 500);
  }
});

// ============= SETTINGS ENDPOINTS =============
app.get('/settings', async (c) => {
  try {
    const settings = await kv.get('api:settings') || {
      facebookPageAccessToken: '',
      facebookPageId: '',
      facebookVerifyToken: '',
      openaiApiKey: '',
    };
    return c.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return c.json({ error: 'Failed to fetch settings' }, 500);
  }
});

app.put('/settings', async (c) => {
  try {
    const settings = await c.req.json();
    await kv.set('api:settings', settings);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error saving settings:', error);
    return c.json({ error: 'Failed to save settings' }, 500);
  }
});

// ============= TEST FACEBOOK CONNECTION =============
app.post('/test-facebook', async (c) => {
  try {
    const { pageAccessToken, pageId } = await c.req.json();

    // Test by fetching page info
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}?fields=name,id&access_token=${pageAccessToken}`
    );

    if (response.ok) {
      const data = await response.json();
      return c.json({ success: true, pageName: data.name, pageId: data.id });
    } else {
      const error = await response.json();
      return c.json({ success: false, error: error.error?.message || 'Unknown error' });
    }
  } catch (error) {
    console.error('Facebook test error:', error);
    return c.json({ success: false, error: 'Connection failed' });
  }
});

// ============= TEST OPENAI CONNECTION =============
app.post('/test-openai', async (c) => {
  try {
    const { apiKey } = await c.req.json();

    // Test by making a simple API call
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      return c.json({ success: true });
    } else {
      const error = await response.json();
      return c.json({ success: false, error: error.error?.message || 'Invalid API key' });
    }
  } catch (error) {
    console.error('OpenAI test error:', error);
    return c.json({ success: false, error: 'Connection failed' });
  }
});

// ============= WEBHOOK ENDPOINTS =============
// Verification endpoint for Facebook
app.get('/webhook', async (c) => {
  const mode = c.req.query('hub.mode');
  const token = c.req.query('hub.verify_token');
  const challenge = c.req.query('hub.challenge');

  const settings = await kv.get('api:settings');
  const verifyToken = settings?.facebookVerifyToken || 'my_verify_token';

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('Webhook verified');
    return c.text(challenge || '');
  } else {
    return c.json({ error: 'Verification failed' }, 403);
  }
});

// Webhook for receiving messages
app.post('/webhook', async (c) => {
  try {
    const body = await c.req.json();

    if (body.object === 'page') {
      for (const entry of body.entry) {
        for (const messaging of entry.messaging) {
          if (messaging.message) {
            await handleMessage(messaging);
          } else if (messaging.postback) {
            await handlePostback(messaging);
          } else if (messaging.referral) {
            await handleReferral(messaging);
          }
        }
      }
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
});

// Handle incoming message
async function handleMessage(messaging: any) {
  const senderId = messaging.sender.id;
  const message = messaging.message.text;

  console.log(`Received message from ${senderId}: ${message}`);

  // Check if user has referral from campaign
  const userCampaign = await kv.get(`user_campaign:${senderId}`);

  // Save conversation
  const conversation = {
    id: messaging.message.mid,
    senderId,
    customerName: `User ${senderId}`,
    lastMessage: message,
    timestamp: new Date().toISOString(),
    source: 'Messenger',
    campaignName: userCampaign?.campaignName,
    unread: true,
    status: 'active',
  };
  await kv.set(`conversation:${senderId}`, conversation);

  // Get AI settings
  const aiSettings = await kv.get('ai:settings') || { enabled: true };
  const apiSettings = await kv.get('api:settings');

  if (!apiSettings?.openaiApiKey || !aiSettings.enabled) {
    // Try to find pre-defined response
    const responses = await kv.getByPrefix('response:') || [];
    const matchingResponse = responses.find((r: any) =>
      message.toLowerCase().includes(r.trigger.toLowerCase())
    );

    if (matchingResponse) {
      await sendMessage(senderId, matchingResponse.message, matchingResponse.imageUrl);
    }
    return;
  }

  // Use OpenAI for response
  try {
    const allKnowledge = await kv.getByPrefix('knowledge:') || [];

    // Filter knowledge by linked product if user came from a campaign
    let knowledgeBase = allKnowledge;
    if (userCampaign?.linkedProduct) {
      const productKnowledge = allKnowledge.filter((k: any) =>
        k.productName && k.productName === userCampaign.linkedProduct
      );
      // If product-specific knowledge exists, use only that. Otherwise use all knowledge.
      if (productKnowledge.length > 0) {
        knowledgeBase = productKnowledge;
      }
    }

    const context = knowledgeBase.map((k: any) => k.content).join('\n\n');

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiSettings.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: aiSettings.model || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `أنت مساعد خدمة عملاء ذكي${userCampaign?.linkedProduct ? ` متخصص في المنتج: ${userCampaign.linkedProduct}` : ''}. استخدم المعلومات التالية للرد على العملاء:\n\n${context}`,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: aiSettings.temperature || 0.7,
      }),
    });

    if (openaiResponse.ok) {
      const data = await openaiResponse.json();
      const aiReply = data.choices[0].message.content;
      await sendMessage(senderId, aiReply);
    }
  } catch (error) {
    console.error('OpenAI error:', error);
  }
}

// Handle postback (button clicks)
async function handlePostback(messaging: any) {
  const senderId = messaging.sender.id;
  const payload = messaging.postback.payload;

  console.log(`Received postback from ${senderId}: ${payload}`);

  // Find campaign button response
  const campaigns = await kv.getByPrefix('campaign:') || [];
  for (const campaign of campaigns) {
    const button = campaign.buttons?.find((b: any) => b.id === payload);
    if (button) {
      await sendMessage(senderId, button.response, button.imageUrl);
      return;
    }
  }
}

// Handle referral
async function handleReferral(messaging: any) {
  const senderId = messaging.sender.id;
  const ref = messaging.referral?.ref || messaging.message?.referral?.ref;

  if (!ref) {
    console.log('No referral ref found');
    return;
  }

  console.log(`Received referral from ${senderId}: ${ref}`);

  // Find campaign by refKey
  const campaigns = await kv.getByPrefix('campaign:') || [];
  let matchedCampaign: any = null;
  
  for (const campaign of campaigns) {
    if (campaign.refKey && campaign.refKey === ref) {
      matchedCampaign = campaign;
      break;
    }
  }

  if (!matchedCampaign) {
    console.log(`No campaign found for ref: ${ref}`);
    // Send fallback message
    await sendMessage(senderId, 'مرحباً بك! كيف يمكننا مساعدتك اليوم؟');
    return;
  }

  // Update impressions and conversions
  matchedCampaign.impressions = (matchedCampaign.impressions || 0) + 1;
  matchedCampaign.conversions = (matchedCampaign.conversions || 0) + 1;
  await kv.set(`campaign:${matchedCampaign.id}`, matchedCampaign);

  // Send initial welcome message
  const welcomeMessage = `مرحباً بك في ${matchedCampaign.name}!\n\n${matchedCampaign.description}`;
  await sendMessage(senderId, welcomeMessage);

  // Send buttons as quick replies
  if (matchedCampaign.buttons && matchedCampaign.buttons.length > 0) {
    await sendMessageWithButtons(senderId, 'اختر أحد الخيارات:', matchedCampaign.buttons);
  }

  // Save campaign reference for this user
  await kv.set(`user_campaign:${senderId}`, {
    campaignId: matchedCampaign.id,
    campaignName: matchedCampaign.name,
    linkedProduct: matchedCampaign.linkedProduct,
    timestamp: new Date().toISOString(),
  });
}

// Send message via Facebook API
async function sendMessage(recipientId: string, message: string, imageUrl?: string) {
  const settings = await kv.get('api:settings');
  if (!settings?.facebookPageAccessToken) {
    console.error('No Facebook access token configured');
    return;
  }

  try {
    const messageData: any = {
      recipient: { id: recipientId },
      message: {},
    };

    if (imageUrl) {
      messageData.message.attachment = {
        type: 'image',
        payload: { url: imageUrl },
      };
      messageData.message.text = message;
    } else {
      messageData.message.text = message;
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/me/messages?access_token=${settings.facebookPageAccessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to send message:', error);
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

// Send message with buttons via Facebook API
async function sendMessageWithButtons(recipientId: string, text: string, buttons: any[]) {
  const settings = await kv.get('api:settings');
  if (!settings?.facebookPageAccessToken) {
    console.error('No Facebook access token configured');
    return;
  }

  try {
    const messageData: any = {
      recipient: { id: recipientId },
      message: {
        text,
        quick_replies: buttons.map(button => ({
          content_type: 'text',
          title: button.label,
          payload: button.id,
        })),
      },
    };

    const response = await fetch(
      `https://graph.facebook.com/v18.0/me/messages?access_token=${settings.facebookPageAccessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to send message with buttons:', error);
    }
  } catch (error) {
    console.error('Error sending message with buttons:', error);
  }
}

// ============= STATS ENDPOINT =============
app.get('/stats', async (c) => {
  try {
    const conversations = await kv.getByPrefix('conversation:') || [];
    const settings = await kv.get('ai:settings') || { enabled: true };
    const campaigns = await kv.getByPrefix('campaign:') || [];

    const today = new Date().toISOString().split('T')[0];
    const newToday = conversations.filter((conv: any) =>
      conv.timestamp?.startsWith(today)
    ).length;

    const activeCampaigns = campaigns.filter((camp: any) =>
      camp.status === 'active'
    ).length;

    const autoReplies = Math.floor(Math.random() * 50) + 20;
    const manualReplies = Math.floor(Math.random() * 20) + 5;

    return c.json({
      totalConversations: conversations.length,
      newToday,
      aiEnabled: settings.enabled,
      activeCampaigns,
      autoReplies,
      manualReplies,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

// ============= AI TOGGLE ENDPOINT =============
app.post('/ai/toggle', async (c) => {
  try {
    const { enabled } = await c.req.json();
    await kv.set('ai:settings', { enabled });
    return c.json({ success: true, enabled });
  } catch (error) {
    console.error('Error toggling AI:', error);
    return c.json({ error: 'Failed to toggle AI' }, 500);
  }
});

// ============= CONVERSATIONS ENDPOINTS =============
app.get('/conversations', async (c) => {
  try {
    const conversations = await kv.getByPrefix('conversation:') || [];

    if (conversations.length === 0) {
      const demoConversations = [
        {
          id: '1',
          customerName: 'أحمد محمد',
          lastMessage: 'ما هي أسعار المنتجات المتاحة؟',
          timestamp: 'منذ 5 دقائق',
          source: 'Facebook',
          campaignName: 'العرض الصيفي',
          unread: true,
          status: 'active',
        },
        {
          id: '2',
          customerName: 'فاطمة علي',
          lastMessage: 'هل الشحن مجاني؟',
          timestamp: 'منذ 15 دقيقة',
          source: 'Messenger',
          campaignName: 'المنتج الجديد',
          unread: false,
          status: 'active',
        },
        {
          id: '3',
          customerName: 'خالد سعيد',
          lastMessage: 'شكراً على المساعدة',
          timestamp: 'منذ ساعة',
          source: 'Facebook',
          unread: false,
          status: 'resolved',
        },
      ];

      for (const conv of demoConversations) {
        await kv.set(`conversation:${conv.id}`, conv);
      }

      return c.json(demoConversations);
    }

    return c.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return c.json({ error: 'Failed to fetch conversations' }, 500);
  }
});

// ============= CAMPAIGNS ENDPOINTS =============
app.get('/campaigns', async (c) => {
  try {
    const campaigns = await kv.getByPrefix('campaign:') || [];

    if (campaigns.length === 0) {
      const demoCampaigns = [
        {
          id: '1',
          name: 'العرض الصيفي',
          description: 'عروض خاصة على جميع المنتجات الصيفية',
          status: 'active',
          conversions: 45,
          impressions: 1250,
          createdAt: '2025-12-01',
          buttons: [
            { id: '1', label: 'السعر', response: 'أسعارنا تبدأ من 199 ريال مع خصم 20% على الطلبات الأولى' },
            { id: '2', label: 'تفاصيل المنتج', response: 'منتجاتنا مصنوعة من أجود الخامات مع ضمان لمدة عامين' },
            { id: '3', label: 'الشحن', response: 'الشحن مجاني للطلبات فوق 500 ريال' },
          ],
        },
      ];

      for (const camp of demoCampaigns) {
        await kv.set(`campaign:${camp.id}`, camp);
      }

      return c.json(demoCampaigns);
    }

    return c.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return c.json({ error: 'Failed to fetch campaigns' }, 500);
  }
});

app.post('/campaigns', async (c) => {
  try {
    const data = await c.req.json();
    const id = Date.now().toString();
    const campaign = {
      id,
      ...data,
      conversions: 0,
      impressions: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    await kv.set(`campaign:${id}`, campaign);
    return c.json(campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    return c.json({ error: 'Failed to create campaign' }, 500);
  }
});

app.put('/campaigns/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const data = await c.req.json();
    const existing = await kv.get(`campaign:${id}`);

    if (!existing) {
      return c.json({ error: 'Campaign not found' }, 404);
    }

    const updated = { ...existing, ...data };
    await kv.set(`campaign:${id}`, updated);
    return c.json(updated);
  } catch (error) {
    console.error('Error updating campaign:', error);
    return c.json({ error: 'Failed to update campaign' }, 500);
  }
});

app.delete('/campaigns/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`campaign:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return c.json({ error: 'Failed to delete campaign' }, 500);
  }
});

// ============= RESPONSES ENDPOINTS =============
app.get('/responses', async (c) => {
  try {
    const responses = await kv.getByPrefix('response:') || [];

    if (responses.length === 0) {
      const demoResponses = [
        {
          id: '1',
          trigger: 'ما هي الأسعار؟',
          message: 'أسعارنا تبدأ من 199 ريال وتصل إلى 999 ريال حسب المنتج والمواصفات.',
          category: 'pricing',
          createdAt: '2025-12-01',
        },
        {
          id: '2',
          trigger: 'هل الشحن مجاني؟',
          message: 'نعم، الشحن مجاني لجميع الطلبات فوق 500 ريال. للطلبات الأقل، تكلفة الشحن 25 ريال فقط.',
          category: 'shipping',
          createdAt: '2025-12-01',
        },
      ];

      for (const resp of demoResponses) {
        await kv.set(`response:${resp.id}`, resp);
      }

      return c.json(demoResponses);
    }

    return c.json(responses);
  } catch (error) {
    console.error('Error fetching responses:', error);
    return c.json({ error: 'Failed to fetch responses' }, 500);
  }
});

app.post('/responses', async (c) => {
  try {
    const data = await c.req.json();
    const id = Date.now().toString();
    const response = {
      id,
      ...data,
      createdAt: new Date().toISOString().split('T')[0],
    };

    await kv.set(`response:${id}`, response);
    return c.json(response);
  } catch (error) {
    console.error('Error creating response:', error);
    return c.json({ error: 'Failed to create response' }, 500);
  }
});

app.put('/responses/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const data = await c.req.json();
    const existing = await kv.get(`response:${id}`);

    if (!existing) {
      return c.json({ error: 'Response not found' }, 404);
    }

    const updated = { ...existing, ...data };
    await kv.set(`response:${id}`, updated);
    return c.json(updated);
  } catch (error) {
    console.error('Error updating response:', error);
    return c.json({ error: 'Failed to update response' }, 500);
  }
});

app.delete('/responses/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`response:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting response:', error);
    return c.json({ error: 'Failed to delete response' }, 500);
  }
});

// ============= AI KNOWLEDGE BASE ENDPOINTS =============
app.get('/ai/knowledge', async (c) => {
  try {
    const knowledge = await kv.getByPrefix('knowledge:') || [];
    return c.json(knowledge);
  } catch (error) {
    console.error('Error fetching knowledge:', error);
    return c.json({ error: 'Failed to fetch knowledge' }, 500);
  }
});

app.post('/ai/knowledge', async (c) => {
  try {
    const data = await c.req.json();
    const id = Date.now().toString();
    const item = {
      id,
      ...data,
      createdAt: new Date().toISOString().split('T')[0],
    };

    await kv.set(`knowledge:${id}`, item);
    return c.json(item);
  } catch (error) {
    console.error('Error creating knowledge item:', error);
    return c.json({ error: 'Failed to create knowledge item' }, 500);
  }
});

app.delete('/ai/knowledge/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`knowledge:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting knowledge item:', error);
    return c.json({ error: 'Failed to delete knowledge item' }, 500);
  }
});

// ============= AI SETTINGS ENDPOINTS =============
app.get('/ai/settings', async (c) => {
  try {
    const settings = await kv.get('ai:settings') || {
      enabled: true,
      model: 'gpt-4',
      temperature: 0.7,
      allowedTopics: [],
      restrictedTopics: [],
    };
    return c.json(settings);
  } catch (error) {
    console.error('Error fetching AI settings:', error);
    return c.json({ error: 'Failed to fetch AI settings' }, 500);
  }
});

app.put('/ai/settings', async (c) => {
  try {
    const settings = await c.req.json();
    await kv.set('ai:settings', settings);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error updating AI settings:', error);
    return c.json({ error: 'Failed to update AI settings' }, 500);
  }
});

// ============= ANALYTICS ENDPOINT =============
app.get('/analytics', async (c) => {
  try {
    const range = c.req.query('range') || '7d';

    const conversationsOverTime = [];
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      conversationsOverTime.push({
        date: date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' }),
        count: Math.floor(Math.random() * 30) + 10,
      });
    }

    const data = {
      conversationsOverTime,
      repliesByType: [
        { name: 'ردود تلقائية (AI)', value: 65 },
        { name: 'ردود جاهزة', value: 25 },
        { name: 'ردود يدوية', value: 10 },
      ],
      topQuestions: [
        { question: 'ما هي الأسعار؟', count: 45 },
        { question: 'هل الشحن مجاني؟', count: 38 },
        { question: 'كم مدة التوصيل؟', count: 32 },
        { question: 'هل يوجد ضمان؟', count: 28 },
        { question: 'كيف يمكن الدفع؟', count: 24 },
      ],
      campaignPerformance: [
        { campaign: 'العرض الصيفي', conversions: 45 },
        { campaign: 'المنتج الجديد', conversions: 32 },
        { campaign: 'خصم 50%', conversions: 28 },
      ],
      aiPerformance: {
        totalReplies: 156,
        successRate: 92,
        avgResponseTime: 1.8,
      },
      dailyStats: {
        newConversations: 23,
        autoReplies: 45,
        manualReplies: 8,
        activeUsers: 67,
      },
    };

    return c.json(data);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return c.json({ error: 'Failed to fetch analytics' }, 500);
  }
});

// ============= PRODUCTS ENDPOINT =============
app.get('/products', async (c) => {
  try {
    // Get all unique product names from knowledge base
    const knowledge = await kv.getByPrefix('knowledge:') || [];
    const productNames = [...new Set(
      knowledge
        .filter((k: any) => k.productName)
        .map((k: any) => k.productName)
    )];
    
    const products = productNames.map(name => ({ name }));
    return c.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return c.json({ error: 'Failed to fetch products' }, 500);
  }
});

// Start server
Deno.serve(app.fetch);
