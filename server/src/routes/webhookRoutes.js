import { Router } from 'express';
import { Webhook } from 'svix';
import User from '../models/User.js';

const router = Router();

// Clerk Webhook - receives events when users are created/updated/deleted
router.post('/clerk', async (req, res) => {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  try {
    let evt;

    if (!webhookSecret) {
      if (process.env.NODE_ENV === 'production') {
        return res.status(503).json({ error: 'Webhook secret not configured on server' });
      }
      evt = req.body;
    } else {
      const wh = new Webhook(webhookSecret);
      evt = wh.verify(JSON.stringify(req.body), {
        'svix-id': req.headers['svix-id'],
        'svix-timestamp': req.headers['svix-timestamp'],
        'svix-signature': req.headers['svix-signature'],
      });
    }

    const eventType = evt.type;
    const data = evt.data;

    switch (eventType) {
      case 'user.created':
      case 'user.updated': {
        const email = data.email_addresses?.[0]?.email_address || '';
        const name = `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'User';

        await User.findOneAndUpdate(
          { clerkId: data.id },
          {
            clerkId: data.id,
            name,
            email,
            profileImage: data.image_url || '',
          },
          { upsert: true, new: true }
        );
        console.log(`✅ Webhook: User ${eventType} - ${email}`);
        break;
      }

      case 'user.deleted': {
        await User.findOneAndDelete({ clerkId: data.id });
        console.log(`✅ Webhook: User deleted - ${data.id}`);
        break;
      }

      default:
        console.log(`ℹ️  Webhook: Unhandled event ${eventType}`);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Webhook error:', err.message);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

export default router;
