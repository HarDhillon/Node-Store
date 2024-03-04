const express = require('express');
const { check, body } = require("express-validator");
const router = express.Router();

const authController = require('../controllers/auth');
const User = require('../models/user')


router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', authController.postLogin);

router.post('/signup',
    // Chcek looks at values in the header, body, cookie, req etc
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .custom((value, { req }) => {
            return User.findOne({ email: value })
                .then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('Email is already in use')
                    }
                })
        }),
    // body will only check values in the body
    body('password', 'Please enter a password with only numbers and text and at least 5 characters')
        .isLength({ min: 5 }).
        isAlphanumeric(),
    // with custom validators we can retrieve additional values like the req
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords have to match')
        }
        return true
    }),
    authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset)

router.post('/reset', authController.postReset)

router.get('/reset/:token', authController.getNewPassword)

router.post('/new-password', authController.postNewPassword)


module.exports = router;