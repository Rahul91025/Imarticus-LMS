const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const Course = require('../models/Course');
const { ensureEnrollment } = require('./courseController');

const hasRazorpay = process.env.RAZORPAY_KEY_ID &&
  process.env.RAZORPAY_KEY_SECRET &&
  !process.env.RAZORPAY_KEY_ID.includes('your-');

const razorpay = hasRazorpay
  ? new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
  : null;

exports.createOrder = async (req, res) => {
  try {
    const { courseId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.hasPaid) return res.json({ message: 'Already paid', alreadyPaid: true });

    let amountInPaise = 50000; // Default fallback to ₹500
    if (courseId) {
      const course = await Course.findById(courseId);
      if (course && course.price) {
        amountInPaise = course.price * 100;
      }
    }

    if (!hasRazorpay) {
      return res.json({
        mock: true,
        orderId: 'mock_order_' + Date.now(),
        amount: amountInPaise,
        currency: 'INR'
      });
    }

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${user._id.toString().slice(-10)}_${Date.now()}`
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    res.status(500).json({ message: 'Could not create order', error: err.error?.description || err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, mock, courseId } = req.body;
    const user = await User.findById(req.user.id);

    if (!mock && hasRazorpay) {
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');
      if (expected !== razorpay_signature) {
        return res.status(400).json({ message: 'Payment verification failed' });
      }
    }

    user.hasPaid = true;
    await user.save();

    if (courseId) {
      await ensureEnrollment(user._id, courseId);
    }

    res.json({ message: 'Payment verified', mock: !!mock });
  } catch (err) {
    res.status(500).json({ message: 'Verification error', error: err.message });
  }
};
