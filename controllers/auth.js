const User = require('../models/user')

exports.getLogin = (req, res, next) => {

    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: false
    })
}

exports.postLogin = (req, res, next) => {

    User.findById("65d8768571936d2f30a8eb20")
        .then(user => {
            req.session.isLoggedIn = true
            req.session.user = user
            // * We use save to ensure that redirect only runs once session is created
            req.session.save(err => {
                res.redirect('/')
            })
        })
        .catch(err => console.log(err))
}

// Cleanup sessions from DB on logout
exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err)
        res.redirect('/')
    })
}