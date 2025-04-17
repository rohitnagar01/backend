const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const { completeProfile } = require('../../controllers/user/profileController');

router.post(
  '/complete',
  auth(['user']),
  upload.fields([
    { name: 'aadharCard', maxCount: 1 },
    { name: 'marksheet', maxCount: 1 }
  ]),
  completeProfile
);

module.exports = router;