const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  getFeaturedCourse,
  getAllCourses,
  getCourseById,
  getEnrolledCourses,
  updateProgress
} = require('../controllers/courseController');

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/featured', getFeaturedCourse);
router.get('/', getAllCourses);
router.get('/enrolled', auth, getEnrolledCourses);
router.get('/:id', getCourseById);
router.put('/:id/progress', auth, updateProgress);
router.post('/:id/module/:moduleIndex/document', auth, upload.single('file'), require('../controllers/courseController').uploadDocument);

module.exports = router;
