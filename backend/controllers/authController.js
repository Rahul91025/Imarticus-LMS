const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const { MailtrapClient } = require("mailtrap");

const hasMailtrapConfig =
  process.env.MAILTRAP_HOST &&
  process.env.MAILTRAP_PORT &&
  process.env.MAILTRAP_USER &&
  process.env.MAILTRAP_PASS;

const TOKEN = "183a0c02eb39f5ac07da87c57b4766e9";
  
const client = new MailtrapClient({
  token: TOKEN,
});

const sender = {
  email: "hello@demomailtrap.co",
  name: "Mailtrap Test",
};
const recipients = [
  {
    email: "rahulgupta109037@gmail.com",
  }
];

const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
        user: 'YOUR_MAILTRAP_USERNAME',
        pass: 'YOUR_MAILTRAP_PASSWORD'
    }
});

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendLoginOtpEmail(email, otp, name) {
  if (!transporter) {
    console.log(`Mailtrap not configured. OTP for ${email}: ${otp}`);
    return;
  }

  await transporter.sendMail({
    from: process.env.MAIL_FROM || 'no-reply@imarticus-lms.local',
    to: email,
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
    `
  });
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


    //  const test1  = await sendLoginOtpEmail(user.email, otp, user.name);

    // console.log("++++++++++++++++++++++++++++++++" , test1)
    client
  .send({
    from: sender,
    to: recipients,
    subject: "You are awesome!",
    text: `Congrats for sending test email with Mailtrap! otp is  ${otp}`,
    category: "Integration Test",
  })
  .then(console.log, console.error);

    res.json({
      requiresOtp: true,
      email: user.email,
      message: hasMailtrapConfig
        ? 'OTP sent to your email'
        : 'OTP generated. Mailtrap is not configured, so check the backend console.'
    });
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
