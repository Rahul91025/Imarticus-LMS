const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, default: 500 },
  duration: String,
  practiceHours: String,
  category: String,
  highlights: [String],
  syllabus: [{
    title: String,
    content: String,
    duration: String,
    videoUrl: String,
    documentTitle: String,
    documentText: String
  }],
  enrolledStudents: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
