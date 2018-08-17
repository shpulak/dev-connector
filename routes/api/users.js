const express = require('express');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

// Load User model
const User = require('../../models/User');

const keys = require('../../config/keys');

const router = express.Router();

/**
 * @route   GET api/users/test
 * @desc    Tests users routes
 * @access  public
 */
router.get('/test', (req, res) => res.json({ msg: 'users works' }));

/**
 * @route   POST api/users/register
 * @desc    Register User
 * @access  public
 */
router.post('/register', (req, res) => {
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: 'Email already exists!' });
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: '200', // Size
        r: 'pg', // rating
        d: 'mm' // default
      });

      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        if (err) throw err;
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

/**
 * @route   POST api/users/login
 * @desc    Login User / Return JWT token
 * @access  public
 */
router.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // Find User
  User.findOne({ email }).then(user => {
    // Check for user
    if (!user) {
      return res.status(404).json({ email: 'User not found' });
    }

    // Check password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // Create JWT Token payload
        const payload = { id: user.id, name: user.name, avatar: user.avatar };

        // Sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 3600 },
          (err, token) => {
            if (err) throw err;
            res.json({
              success: true,
              token: `Bearer ${token}`
            });
          }
        );
      } else {
        return res.status(400).json({ password: 'Password Incorrect' });
      }
    });
  });
});

/**
 * @route   POST api/users/current
 * @desc    Return current user
 * @access  private
 */
router.post(
  '/current',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    // res.json({ msg: 'Success' });
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);
module.exports = router;
