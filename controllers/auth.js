const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const crypto = require('crypto')

const { validationResult } = require("express-validator");

const User = require('../models/user');

// Transport for nodemailer sends to our mailtrap test inbox
var transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
});
exports.getLogin = (req, res, next) => {

  // flash('error') will return empty array if no message inside
  let message = req.flash('error')
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }

  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false,
    errorMessage: message,
    oldInput: {
      email: ""
    }
  });
};

exports.getSignup = (req, res, next) => {

  let message = req.flash('error')
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false,
    errorMessage: message,
    oldInput: { email: "", password: "", confirmPassword: "" },
    validationErrors: []
  });
};

exports.postLogin = (req, res, next) => {

  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(422)
      .render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: false,
        errorMessage: errors.array()[0].msg,
        oldInput: {
          email: req.body.email
        }
      });
  }
  // If no errors isLoggedIn will be saved as true in session
  // redirect to home page
  res.redirect('/');
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email
  const password = req.body.password
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    console.log(errors)
    return res.status(422)
      .render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        isAuthenticated: false,
        errorMessage: errors.array()[0].msg,
        oldInput: { email, password, confirmPassword: req.body.confirmPassword },
        validationErrors: errors.array()
      });
  }

  bcrypt.hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] }
      })
      return user.save()
    })
    .then(result => {
      res.redirect('/login')

      return transport.sendMail({
        to: email,
        from: 'shop@demomailtrap.com',
        subject: 'Signup Success',
        html: '<h1>You have signed up</h1>'
      })

    })
    .catch(err => {
      console.log(err)
    })
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash('error')
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }

  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  })
}

exports.postReset = (req, res, next) => {
  // Generate token to send to user email
  let token
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err)
      return res.redirect('reset')
    }
    token = buffer.toString('hex')
  })

  // Check if user with email exists
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        req.flash('error', 'No Email found')
        return res.redirect('/reset')
      }
      user.resetToken = token
      // Token to expire in 1 hour
      user.resetTokenExpiration = Date.now() + 3600000
      return user.save()
    })
    .then(result => {
      res.redirect('/login')
      return transport.sendMail({
        to: req.body.email,
        from: 'shop@demomailtrap.com',
        subject: 'Password Reset',
        html: `
          <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to reset your password `
      })
    })
    .catch(err => console.log(err))

}

exports.getNewPassword = (req, res, next) => {

  const token = req.params.token
  // $gt is a greater than comparison
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then(user => {

      let message = req.flash('error')
      if (message.length > 0) {
        message = message[0]
      } else {
        message = null
      }

      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token
      })
    })
    .catch(err => console.log(err))

}

exports.postNewPassword = (req, res, next) => {
  const { newPassword, userId, passwordToken } = req.body
  let resetUser

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId
  })
    .then(user => {
      resetUser = user
      return bcrypt.hash(newPassword, 12)
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      // No longer need the token values
      resetUser.resetToken = undefined
      resetUser.resetUser = undefined
      return resetUser.save()
    })
    .then(result => {
      res.redirect('/login')
    })
    .catch(err => console.log(err))

}