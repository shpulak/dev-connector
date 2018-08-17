const express = require('express');
const router = express.Router();

/**
 * @route   GET api/profile/test
 * @desc    Tests profile routes
 * @access  public
 */
router.get('/test', (req, res) => res.json({ msg: 'profile works' }));

module.exports = router;
