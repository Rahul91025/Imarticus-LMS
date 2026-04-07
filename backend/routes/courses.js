const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  getFeaturedCourse,
  getAllCourses,
  getCourseById,
  getEnrolledCourses,
  updateProgress
} = require('../controllers/courseController');

router.get('/featured', getFeaturedCourse);
router.get('/', getAllCourses);
router.get('/enrolled', auth, getEnrolledCourses);
router.get('/:id', getCourseById);
router.put('/:id/progress', auth, updateProgress);

module.exports = router;
