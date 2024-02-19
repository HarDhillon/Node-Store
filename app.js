const express = require('express')
const path = require('path')
const rootDir = require('./util/path')
const app = express()

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop');

const errorController = require('./controllers/error');

const mongoConnect = require('./util/database').mongoConnect


app.set('view engine', 'ejs');
//? bodyParser is now part of express so we can actually just do this
app.use(express.urlencoded({ extended: true }))
//? Determine where static files will come from
app.use(express.static(path.join(rootDir, 'public')))

// Store our sequelize object in our request.
app.use((req, res, next) => {
    // User.findByPk(1)
    //     .then(user => {
    //         req.user = user
    //         next()
    //     })
    //     .catch(err => console.log(err))
    next()
})

// putting a /argument here will only run if the url is /admin/*something*
app.use('/admin', adminRoutes)
app.use(shopRoutes)

// Any other routes not matching
app.use(errorController.get404)

mongoConnect(() => {
    app.listen(3000)
})