// API بسيط لقراءة وحفظ البيانات المشتركة (المستخدمون / المنشورات / الصور الرمزية)
// في قاعدة بيانات Vercel KV، بدل ما تبقى محبوسة في localStorage كل جهاز لوحده.
//
// GET  /api/data?key=tfs_users   -> { key, value }
// POST /api/data  body: { key, value }  -> { ok: true }
//
// المفاتيح المسموح بها محدودة عمدًا لمنع أي حد يكتب مفاتيح عشوائية في القاعدة.

import { kv } from '@vercel/kv';

const ALLOWED_KEYS = new Set(['tfs_users', 'tfs_posts', 'tfs_avatars']);

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const key = req.query.key;
      if (!ALLOWED_KEYS.has(key)) {
        return res.status(400).json({ error: 'مفتاح غير مسموح' });
      }
      const value = await kv.get(key);
      return res.status(200).json({ key, value: value ?? null });
    }

    if (req.method === 'POST') {
      const { key, value } = req.body || {};
      if (!ALLOWED_KEYS.has(key)) {
        return res.status(400).json({ error: 'مفتاح غير مسموح' });
      }
      await kv.set(key, value);
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'طريقة غير مسموحة' });
  } catch (err) {
    console.error('API /api/data error:', err);
    return res.status(500).json({ error: 'حدث خطأ في السيرفر، حاول مرة أخرى' });
  }
}
