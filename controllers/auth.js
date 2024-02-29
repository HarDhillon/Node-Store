const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const crypto = require('crypto')

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
    errorMessage: message
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
    errorMessage: message
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email
  const password = req.body.password

  User.findOne({ email: email })
    .then(user => {
      // If user email doesnt exist return to login page
      if (!user) {
        // flash sets a temporary key value in our sesssion
        req.flash('error', 'Invalid Email or Password')
        return res.redirect('/login')
      }
      bcrypt.compare(password, user.password)
        .then(doMatch => {
          if (doMatch === true) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            });
          }
          // If doMatch is false then passwords dont match:
          req.flash('error', 'Invalid Email or Password')
          res.redirect('/login')
        })
        .catch(err => {
          console.log(err)
          res.redirect('/login')
        })
    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email
  const password = req.body.password
  const confirmPassword = req.body.confirmPassword

  User.findOne({ email: email })
    .then(userDoc => {

      if (userDoc) {
        req.flash('error', 'Email already in use')
        return res.redirect('/signup')
      }

      return bcrypt.hash(password, 12)
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
    })
    .catch(err => console.log(err))
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