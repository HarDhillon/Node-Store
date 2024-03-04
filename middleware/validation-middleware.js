const { check, body } = require("express-validator");
const bcrypt = require('bcryptjs')
const User = require('../models/user')

exports.validateUserExists = body('email')
    .custom((value, { req }) => {

        const password = req.body.password

        return User.findOne({ email: value })
            .then(user => {
                // If user email doesnt exist return
                if (!user) {
                    throw new Error('Invalid Email or Password')
                }
                return bcrypt.compare(password, user.password)
                    .then(doMatch => {
                        if (doMatch === true) {
                            req.session.isLoggedIn = true;
                            req.session.user = user;

                            return new Promise((resolve, reject) => {
                                req.session.save(err => {
                                    if (err) {
                                        reject(err); // Reject if session saving fails
                                    } else {
                                        resolve(true); // Resolve if session saving succeeds
                                    }
                                });
                            });

                        } else {
                            throw new Error('Invalid Email or Password')
                        }
                    })
            })

    })

exports.validateEmail =
    // check looks at values in the header, body, cookie, req etc
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .custom(value => {
            return User.findOne({ email: value })
                .then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('Email is already in use')
                    }
                })
        }),


    exports.validatePasswordLength =
    // body will only check values in the body
    body('password', 'Please enter a password with only numbers and text and at least 5 characters')
        .isLength({ min: 5 }).
        isAlphanumeric(),


    exports.validatePasswordMatch =
    // with custom validators we can retrieve additional values like the req
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords have to match')
        }
        return true
    })
