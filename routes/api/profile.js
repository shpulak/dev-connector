const express = require('express');
const router = express.Router();
// const mongoose = require('mongoose');
const passport = require('passport');

// Load models
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// Load validation utils
const validateProfileInput = require('../../validations/profile');
const validateExperienceInput = require('../../validations/experience');
const validateEducationInput = require('../../validations/education');

const ErrorHandler = require('../../utils/error_handler');
/**
 * @route   GET api/profile/test
 * @desc    Tests profile routes
 * @access  public
 */
router.get('/test', (req, res) => res.json({ msg: 'profile works' }));

/**
 * @route   GET api/profile
 * @desc    Get current users profile
 * @access  private
 */
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
      .populate('user', ['name', 'avatar'])
      .then(profile => {
        if (!profile) {
          errors.noprofile = 'There is no profile for this user';
          return ErrorHandler.notFound(errors, res);
        }
        res.json(profile);
      })
      .catch(err => ErrorHandler.notFound(err, res));
  }
);

/**
 * @route   GET api/profile/all
 * @desc    Get all profiles
 * @access  public
 */
router.get('/all', (req, res) => {
  const errors = {};
  Profile.find()
    .populate('user', ['name', 'avatar'])
    .then(profiles => {
      if (!profiles) {
        errors.noprofile = "Profile doesn't exist for this user";
        return ErrorHandler.notFound(errors, res);
      }

      res.json(profiles);
    })
    .catch(err => {
      errors.noprofile = 'There are no profiles';
      console.log(err);
      ErrorHandler.notFound(errors, res);
    });
});

/**
 * @route   GET api/profile/handle/:handle
 * @desc    Get Profile by handle
 * @access  public
 */
router.get('/handle/:handle', (req, res) => {
  const errors = {};
  Profile.findOne({ handle: req.params.handle })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "Profile doesn't exist for this user";
        return ErrorHandler.notFound(errors, res);
      }

      res.json(profile);
    })
    .catch(err => ErrorHandler.notFound(err, res));
});

/**
 * @route   GET api/profile/user/:user_id
 * @desc    Get Profile by user id
 * @access  public
 */
router.get('/user/:user_id', (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.params.user_id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "Profile doesn't exist for this user";
        return ErrorHandler.notFound(errors, res);
      }

      res.json(profile);
    })
    .catch(err => {
      errors.noprofile = "Profile doesn't exist for this user";
      console.log(err);
      return ErrorHandler.notFound(errors, res);
    });
});

/**
 * @route   POST api/profile
 * @desc    Create/Update user profile
 * @access  private
 */
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    if (!isValid) {
      return ErrorHandler.badRequest(errors, res);
    }
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername) profileFields.githubusername = req.body.handle;
    // Skills,  split to array
    if (typeof req.body.skills !== 'undefined') {
      profileFields.skills = req.body.skills.split(',');
    }
    // Social Links
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        // Update
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then(profile => res.json(profile));
      } else {
        // Create
        // Check if Handle exists
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if (profile) {
            errors.handle = 'That handle already exists';
            return ErrorHandler.notFound(errors, res);
          }
        });

        // Save new profile
        new Profile(profileFields).save().then(profile => res.json(profile));
      }
    });
  }
);

/**
 * @route   POST api/profile/experience
 * @desc    Add experience to profile
 * @access  private
 */
router.post(
  '/experience',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);

    if (!isValid) {
      return ErrorHandler.badRequest(errors, res);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      // Add to experience
      profile.experience.unshift(newExp);
      profile.save().then(profile => res.json(profile));
    });
  }
);

/**
 * @route   POST api/profile/education
 * @desc    Add education to profile
 * @access  private
 */
router.post(
  '/education',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);

    if (!isValid) {
      return ErrorHandler.badRequest(errors, res);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      const newEducation = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      // Add to experience
      profile.education.unshift(newEducation);
      profile.save().then(profile => res.json(profile));
    });
  }
);

/**
 * @route   DELETE api/profile/experience/:exp_id
 * @desc    Delete experience from user profile
 * @access  private
 */
router.delete(
  '/experience/:exp_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // Get remove index
        const removeIndex = profile.experience
          .map(exp => exp.id)
          .indexOf(req.params.exp_id);

        // Splice out of array
        profile.experience.splice(removeIndex, 1);

        // Save
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => ErrorHandler.notFound(err, res));
  }
);

/**
 * @route   DELETE api/profile/education/:edu_id
 * @desc    Delete education from user profile
 * @access  private
 */
router.delete(
  '/education/:edu_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // Get remove index
        const removeIndex = profile.education
          .map(edu => edu.id)
          .indexOf(req.params.edu_id);

        // Splice out of array
        profile.education.splice(removeIndex, 1);

        // Save
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => ErrorHandler.notFound(err, res));
  }
);

/**
 * @route   DELETE api/profile
 * @desc    Delete user and profile
 * @access  private
 */
router.delete(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id }).then(() => {
      User.findOneAndRemove({ _id: req.user.id }).then(() =>
        res.json({ success: true })
      );
    });
  }
);
module.exports = router;
