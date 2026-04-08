const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { MailtrapClient } = require("mailtrap");

const hasMailtrapConfig = process.env.MAILTRAP_TOKEN;

const client = process.env.MAILTRAP_TOKEN
  ? new MailtrapClient({ token: process.env.MAILTRAP_TOKEN })
  : null;

const sender = {
  // Mailtrap's send API works with a verified sender or their demo sender.
  email: process.env.MAILTRAP_SENDER_EMAIL || "hello@demomailtrap.co",
  name: process.env.MAILTRAP_SENDER_NAME || "Imarticus LMS",
};

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendLoginOtpEmail(email, otp, name) {
  if (!hasMailtrapConfig || !client) {
    console.log(`Mailtrap not configured. OTP for ${email}: ${otp}`);
    return {
      delivered: false,
      reason: 'mailtrap_not_configured',
    };
  }

  try {
    await client.send({
      from: sender,
      to: [{ email }],
      subject: 'Your Imarticus login OTP',
      text: `Hello ${name || 'User'}, your OTP is ${otp}. It will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #1f2937;">
          <h2>Your Login OTP</h2>
          <p>Hello ${name || 'User'},</p>
          <p>Use this OTP to complete your login:</p>
          <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px;">${otp}</p>
          <p>This OTP will expire in 10 minutes.</p>
        </div>
      `,
      category: 'Login OTP'
    });
    return {
      delivered: true,
      reason: 'sent',
    };
  } catch (error) {
    const details = error.response?.data || error.message;
    console.error('Failed to send OTP email via Mailtrap:', details);
    console.log(`Fallback OTP for ${email}: ${otp}`);
    return {
      delivered: false,
      reason: typeof details === 'string' ? details : JSON.stringify(details),
    };
  }
}

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, hasPaid: user.hasPaid }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'All fields required' });

    const user = await User.findOne({ email });
    console.log("+++++++++++++++++++++++++", user);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await user.checkPassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const otp = generateOtp();
    user.loginOtp = otp;
    user.loginOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();


    const mailResult = await sendLoginOtpEmail(user.email, otp, user.name);

    const response = {
      requiresOtp: true,
      email: user.email,
      message: mailResult?.delivered
        ? 'OTP sent to your email'
        : 'OTP email could not be delivered. Use the OTP shown below for local testing, or configure a verified sender domain/provider.'
    };

    if (!mailResult?.delivered) {
      response.mailError = mailResult?.reason || 'unknown_mail_error';
      if (process.env.NODE_ENV !== 'production') {
        response.devOtp = otp;
      }
    }

    res.json(response);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isExpired = !user.loginOtpExpiresAt || user.loginOtpExpiresAt.getTime() < Date.now();
    if (isExpired) {
      user.loginOtp = null;
      user.loginOtpExpiresAt = null;
      await user.save();
      return res.status(400).json({ message: 'OTP expired. Please login again.' });
    }

    if (user.loginOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    user.loginOtp = null;
    user.loginOtpExpiresAt = null;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, hasPaid: user.hasPaid }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user._id, name: user.name, email: user.email, hasPaid: user.hasPaid });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
