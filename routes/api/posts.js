const express = require('express');
const router = express.Router();
// const mongoose = require('mongoose');
const passport = require('passport');

// Load Post Model
const Post = require('../../models/Post');

// Load Validation utils
const validatePostInput = require('../../validations/post');

// Load Error Handling Util
const ErrorHandler = require('../../utils/error_handler');

/**
 * @route   GET api/posts/test
 * @desc    Tests posts routes
 * @access  public
 */
router.get('/test', (req, res) => res.json({ msg: 'posts works' }));

/**
 * @route   POST api/posts
 * @desc    Create a post
 * @access  private
 */
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
      return ErrorHandler.badRequest(errors, res);
    }
    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });

    newPost.save().then(post => res.json(post));
  }
);

module.exports = router;
