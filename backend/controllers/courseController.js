const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

exports.getFeaturedCourse = async (req, res) => {
  try {
    const course = await Course.findOne({ isFeatured: true });
    if (!course) return res.status(404).json({ message: 'No featured course found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getEnrolledCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user.id }).populate('course');
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { moduleTitle } = req.body;
    const enrollment = await Enrollment.findOne({ user: req.user.id, course: req.params.id });
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });

    if (moduleTitle && !enrollment.completedModules.includes(moduleTitle)) {
      enrollment.completedModules.push(moduleTitle);
    }

    const course = await Course.findById(req.params.id);
    if (course && course.syllabus.length > 0) {
      enrollment.progress = Math.round((enrollment.completedModules.length / course.syllabus.length) * 100);
    }

    await enrollment.save();
    res.json(enrollment);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.ensureEnrollment = async (userId, courseId) => {
  let enrollment = await Enrollment.findOne({ user: userId, course: courseId });
  if (!enrollment) {
    enrollment = await Enrollment.create({ user: userId, course: courseId });
    await User.findByIdAndUpdate(userId, { $push: { enrolledCourses: enrollment._id } });
    await Course.findByIdAndUpdate(courseId, { $inc: { enrolledStudents: 1 } });
  }
  return enrollment;
};

const pdfParse = require('pdf-parse');

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    
    // Parse the PDF buffer
    let documentText = '';
    try {
      const data = await pdfParse(req.file.buffer);
      documentText = data.text;
    } catch (parseErr) {
      return res.status(500).json({ message: 'Error parsing PDF', error: parseErr.message });
    }

    const { id, moduleIndex } = req.params;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (!course.syllabus[moduleIndex]) return res.status(404).json({ message: 'Module not found' });

    course.syllabus[moduleIndex].documentTitle = req.file.originalname;
    course.syllabus[moduleIndex].documentText = documentText;

    await course.save();
    res.json({ message: 'Document uploaded successfully', module: course.syllabus[moduleIndex] });
  } catch (err) {
    console.error('SERVER ERROR IN UPLOAD:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
