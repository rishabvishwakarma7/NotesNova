import User from '../models/User.js';
import PremiumRequest from '../models/PremiumRequest.js';

// ── UPI / QR config (update these in production) ──────────────────────────
const UPI_CONFIG = {
  upiId:        process.env.UPI_ID        || 'notenova@upi',
  merchantName: process.env.MERCHANT_NAME || 'NoteNova AI',
  amount:       99,
  description:  'NoteNova Premium Membership',
};

// ── Get UPI config ─────────────────────────────────────────────────────────
export const getUpiConfig = async (_req, res) => {
  res.json(UPI_CONFIG);
};

// ── Get my premium status ──────────────────────────────────────────────────
export const getPremiumStatus = async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.userId })
      .select('isPremium premiumStatus premiumSince premiumExpiry premiumPlan paymentMethod');
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Check expiry
    if (user.isPremium && user.premiumExpiry && new Date(user.premiumExpiry) < new Date()) {
      await User.findOneAndUpdate({ clerkId: req.userId }, { isPremium: false, premiumStatus: 'expired' });
      return res.json({ isPremium: false, premiumStatus: 'expired' });
    }

    const pending = await PremiumRequest.findOne({ userId: req.userId, status: 'pending' });
    res.json({
      isPremium:       user.isPremium,
      premiumStatus:   user.premiumStatus,
      premiumSince:    user.premiumSince,
      premiumExpiry:   user.premiumExpiry,
      premiumPlan:     user.premiumPlan,
      hasPendingRequest: !!pending,
      pendingRequestId:  pending?._id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Submit payment request ─────────────────────────────────────────────────
export const submitPremiumRequest = async (req, res) => {
  try {
    const { name, email, phone, transactionId, utrNumber, paymentApp, screenshot } = req.body;

    if (!transactionId?.trim() || !utrNumber?.trim()) {
      return res.status(400).json({ error: 'Transaction ID and UTR are required' });
    }

    // Block duplicate pending requests
    const existing = await PremiumRequest.findOne({ userId: req.userId, status: 'pending' });
    if (existing) {
      return res.status(400).json({ error: 'You already have a pending request. Please wait for admin approval.' });
    }

    // Already premium
    const user = await User.findOne({ clerkId: req.userId });
    if (user?.isPremium) {
      return res.status(400).json({ error: 'You are already a Premium member.' });
    }

    // Block duplicate UTR
    const dupUTR = await PremiumRequest.findOne({ utrNumber: utrNumber.trim() });
    if (dupUTR) {
      return res.status(400).json({ error: 'This UTR number has already been submitted.' });
    }

    const request = await PremiumRequest.create({
      userId: req.userId,
      name: name || user?.name || '',
      email: email || user?.email || '',
      phone: phone || '',
      transactionId: transactionId.trim(),
      utrNumber: utrNumber.trim(),
      paymentApp: paymentApp || 'Other',
      amount: 99,
      screenshot: screenshot || null,
    });

    // Update user status to pending
    await User.findOneAndUpdate({ clerkId: req.userId }, { premiumStatus: 'pending' });

    res.status(201).json({ message: 'Payment request submitted successfully', requestId: request._id });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'This UTR number has already been submitted.' });
    }
    res.status(500).json({ error: err.message });
  }
};

// ── Admin: get all premium requests ───────────────────────────────────────
export const getAdminPremiumRequests = async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 20;
    const status = req.query.status || '';
    const search = req.query.search || '';
    const sort   = req.query.sort === 'oldest' ? 1 : -1;

    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name:          { $regex: search, $options: 'i' } },
        { email:         { $regex: search, $options: 'i' } },
        { utrNumber:     { $regex: search, $options: 'i' } },
        { transactionId: { $regex: search, $options: 'i' } },
      ];
    }

    const [requests, total] = await Promise.all([
      PremiumRequest.find(query).sort({ createdAt: sort }).skip((page - 1) * limit).limit(limit),
      PremiumRequest.countDocuments(query),
    ]);

    const counts = await Promise.all([
      PremiumRequest.countDocuments({ status: 'pending' }),
      PremiumRequest.countDocuments({ status: 'approved' }),
      PremiumRequest.countDocuments({ status: 'rejected' }),
    ]);

    res.json({
      requests, total, page, pages: Math.ceil(total / limit),
      counts: { pending: counts[0], approved: counts[1], rejected: counts[2] },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Admin: approve request ─────────────────────────────────────────────────
export const approvePremiumRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await PremiumRequest.findById(id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ error: 'Request is not pending' });

    const now = new Date();
    await Promise.all([
      PremiumRequest.findByIdAndUpdate(id, {
        status: 'approved', reviewedBy: 'admin', reviewedAt: now,
      }),
      User.findOneAndUpdate({ clerkId: request.userId }, {
        isPremium: true,
        premiumStatus: 'active',
        premiumSince: now,
        premiumExpiry: null, // lifetime
        premiumPlan: request.plan || 'basic_99',
        approvedBy: 'admin',
        approvedAt: now,
        paymentId: request.utrNumber,
        paymentMethod: request.paymentApp,
        paymentScreenshot: request.screenshot,
      }),
    ]);

    res.json({ message: 'Premium activated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Admin: reject request ──────────────────────────────────────────────────
export const rejectPremiumRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Payment not verified' } = req.body;

    const request = await PremiumRequest.findById(id);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    await Promise.all([
      PremiumRequest.findByIdAndUpdate(id, {
        status: 'rejected', rejectionReason: reason,
        reviewedBy: 'admin', reviewedAt: new Date(),
      }),
      User.findOneAndUpdate({ clerkId: request.userId }, {
        premiumStatus: 'rejected',
      }),
    ]);

    res.json({ message: 'Request rejected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Admin: manually grant premium ─────────────────────────────────────────
export const grantPremium = async (req, res) => {
  try {
    const { userId } = req.params;
    const now = new Date();
    await User.findOneAndUpdate({ clerkId: userId }, {
      isPremium: true, premiumStatus: 'active',
      premiumSince: now, premiumExpiry: null,
      premiumPlan: 'admin_grant', approvedBy: 'admin', approvedAt: now,
    });
    res.json({ message: 'Premium granted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Admin: revoke premium ─────────────────────────────────────────────────
export const revokePremium = async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findOneAndUpdate({ clerkId: userId }, {
      isPremium: false, premiumStatus: 'none',
      premiumSince: null, premiumExpiry: null,
    });
    res.json({ message: 'Premium revoked' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Admin: grant premium by email ─────────────────────────────────────────
export const grantPremiumByEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email?.trim()) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOneAndUpdate(
      { email: email.trim().toLowerCase() },
      {
        isPremium: true, premiumStatus: 'active',
        premiumSince: new Date(), premiumExpiry: null,
        premiumPlan: 'admin_grant', approvedBy: 'admin', approvedAt: new Date(),
      },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: `No user found with email: ${email}` });
    res.json({ message: `Premium granted to ${user.name} (${user.email})`, user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
