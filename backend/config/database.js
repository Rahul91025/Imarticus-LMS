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
        { 
          title: 'Financial Accounting', 
          content: 'Fundamentals of accounting, balance sheets, income statements and cash flow analysis.', 
          duration: '6 months',
          videoUrl: 'https://www.youtube.com/watch?v=GuVCuK0ZcIw' 
        },
        { 
          title: 'Business Economics', 
          content: 'Micro and macroeconomic principles applied to business decision-making.', 
          duration: '4 months',
          videoUrl: 'https://www.youtube.com/watch?v=GuVCuK0ZcIw' 
        },
        { 
          title: 'Investment Analysis', 
          content: 'Portfolio theory, equity valuation, fixed income and derivatives.', 
          duration: '5 months',
          videoUrl: 'https://www.youtube.com/watch?v=GuVCuK0ZcIw' 
        },
        { 
          title: 'Corporate Finance', 
          content: 'Capital structure, mergers & acquisitions, and financial planning.', 
          duration: '5 months',
          videoUrl: 'https://www.youtube.com/watch?v=GuVCuK0ZcIw' 
        }
      ]
    });
    console.log('Featured course seeded');
  }

  const mlCourse = await Course.findOne({ title: 'Introduction to Machine Learning' });
  if (!mlCourse) {
    await Course.create({
      title: 'Introduction to Machine Learning',
      description: 'Machine learning is a field of computer science that uses statistical techniques to give computer systems the ability to "learn" with data, without being explicitly programmed. The course of Introduction to Machine Learning is a free online certification course.',
      price: 0,
      duration: '75 mins',
      practiceHours: '10+',
      category: 'Technology',
      isFeatured: false,
      highlights: [
        'Concept Videos',
        'Practice Quizzes',
        'Certificate of Completion',
        'Discussion and Mentorship'
      ],
      syllabus: [
        { 
          title: 'Introduction', 
          content: 'Basic Concepts of Machine Learning', 
          duration: '10 mins',
          videoUrl: 'https://www.youtube.com/watch?v=GuVCuK0ZcIw' 
        },
        { 
          title: 'Project: Cost of Flats', 
          content: 'Applying Linear Regression', 
          duration: '15 mins',
          videoUrl: 'https://www.youtube.com/watch?v=GuVCuK0ZcIw' 
        },
        { 
          title: 'Linear & Polymer Regression', 
          content: 'Linear Regression, Polymer Regression, Logistic Regression', 
          duration: '20 mins',
          videoUrl: 'https://www.youtube.com/watch?v=GuVCuK0ZcIw' 
        },
        { 
          title: 'Neural Network and Deep Learning', 
          content: 'Neural Network and Deep Learning basics', 
          duration: '30 mins',
          videoUrl: 'https://www.youtube.com/watch?v=GuVCuK0ZcIw' 
        }
      ]
    });
    console.log('Machine Learning course seeded');
  }
}

module.exports = connectDB;
