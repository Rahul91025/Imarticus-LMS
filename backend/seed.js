const mongoose = require('mongoose');
const connectDB = require('./config/database');
const Course = require('./models/Course');
const User = require('./models/User');

const seedData = async () => {
  await connectDB();

  // Already auto-seeded, but ensure
  await Course.findOneAndUpdate(
    { slug: 'ug-program-finance-business' },
    {
      $set: {
        title: 'UG Program in Finance and Business',
        description: 'A three-year undergraduate programme designed to make learners real-world ready through finance depth, global immersions, simulations, and AI-enabled decision making. Apply now for Rs. 500 debug access.',
        highlights: [
          'ACCA & CFA aligned curriculum',
          'Singapore + India immersions',
          'Boardroom simulations & market labs',
          'AI study tools included'
        ],
        syllabus: [
          { title: 'Year 1: Foundations', content: 'Accounting, Economics, Markets, Corporate Finance.' },
          { title: 'Year 2: Applied Skills', content: 'Case studies, simulations, global exposure.' },
          { title: 'Year 3: Advanced', content: 'AI decision tools, capstone projects, career prep.' }
        ]
      }
    },
    { upsert: true }
  );

  console.log('✅ Seed complete. Featured course ready.');
  process.exit(0);
};

seedData().catch(err => {
  console.error(err);
  process.exit(1);
});

