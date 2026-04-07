const router = require('express').Router();
const auth = require('../middleware/auth');
const { summarize } = require('../controllers/aiController');

router.post('/summarize', auth, summarize);

module.exports = router;
