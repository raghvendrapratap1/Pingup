import express from 'express';
import imagekit from '../config/imageKit.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Returns authentication params for client-side ImageKit uploads
router.get('/auth', auth, (req, res) => {
  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    res.json({ success: true, ...authenticationParameters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to get ImageKit auth' });
  }
});

export default router;


