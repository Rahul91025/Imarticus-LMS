const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set');
  await mongoose.connect(uri);
  console.log('MongoDB connected');

  const Course = require('../models/Course');
  const existing = await Course.findOne({ isFeatured: true });
  if (!existing) {
    await Course.create({
      title: 'UG Program in Finance & Business',
      description: 'A 3-year full-time program covering ACCA, CFA-aligned curriculum with global exposure through Singapore immersion, boardroom simulations, and market labs.',
      price: 500,
      duration: '3 Years',
      practiceHours: '500+',
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
    });
    console.log('Featured course seeded');
  }
}

module.exports = connectDB;
