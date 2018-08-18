const express = require('express');
const router = express.Router();
// const mongoose = require('mongoose');
const passport = require('passport');

// Load Models
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');

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
 * @route   GET api/posts
 * @desc    Get all posts
 * @access  public
 */
router.get('/', (req, res) => {
  const errors = {};
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => {
      errors.nopostsfound = 'No posts found';
      console.log(err);
      ErrorHandler.notFound(errors, res);
    });
});

/**
 * @route   GET api/posts/:id
 * @desc    Get post by id
 * @access  public
 */
router.get('/:id', (req, res) => {
  const errors = {};
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err => {
      errors.nopostfound = 'No post found for the id';
      console.log(err);
      ErrorHandler.notFound(errors, res);
    });
});

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

/**
 * @route   DELETE api/posts/:id
 * @desc    Delete a post
 * @access  private
 */
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        Post.findById(req.params.id).then(post => {
          // Check for post owner
          if (post.user.toString() !== req.user.id) {
            errors.notauthorized = 'User not authorized for this action';
            return ErrorHandler.unauthorizedRequest(errors, res);
          }

          // Remove post
          post.remove().then(() => res.json({ success: true }));
        });
      })
      .catch(err => {
        errors.nopostfound = 'No post found';
        console.log(err);
        ErrorHandler.notFound(errors, res);
      });
  }
);
module.exports = router;
