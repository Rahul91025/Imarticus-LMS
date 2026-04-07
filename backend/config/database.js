const mongoose = require('mongoose');
const Course = require('../models/Course');

const defaultCourse = {
  title: 'UG Program in Finance & Business',
  description: 'A 3-year full-time program covering ACCA, CFA-aligned curriculum with global exposure through Singapore immersion, boardroom simulations, and market labs.',
  price: 500,
  duration: '3 Years',
  category: 'Finance',
  isFeatured: true,
  highlights: [
    'ACCA and CFA-aligned curriculum',
    'Singapore immersion program',
    'Boardroom simulations and market labs',
    'AI-powered study tools included'
  ],
  syllabus: [
    { title: 'Financial Accounting', content: 'Fundamentals of accounting, balance sheets, income statements and cash flow analysis.', duration: '6 months' },
    { title: 'Business Economics', content: 'Micro and macroeconomic principles applied to business decision-making.', duration: '4 months' },
    { title: 'Investment Analysis', content: 'Portfolio theory, equity valuation, fixed income and derivatives.', duration: '5 months' },
    { title: 'Corporate Finance', content: 'Capital structure, mergers & acquisitions, and financial planning.', duration: '5 months' }
  ]
};

async function connectDB() {
  try {
    let uri = process.env.MONGODB_URI;

    if (!uri || uri.includes('your-connection-string')) {
      console.log('No real MongoDB URI found, using in-memory database...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const server = await MongoMemoryServer.create();
      uri = server.getUri();
    }

    await mongoose.connect(uri);
    console.log('MongoDB connected');

    const existing = await Course.findOne({ isFeatured: true });
    if (!existing) {
      await Course.create(defaultCourse);
      console.log('Default course created');
    }
  } catch (err) {
    console.error('DB connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
