require('dotenv').config();

const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)

const path = require('path')
const rootDir = require('./util/path')

const app = express()

// Set up store to save our sesssions in the DB rather than memory
const store = new MongoDBStore({
    uri: process.env.MONGODB_URI,
    collection: 'sessions'
})

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const errorController = require('./controllers/error');

const User = require('./models/user')


app.set('view engine', 'ejs');
//? bodyParser is now part of express so we can actually just do this
app.use(express.urlencoded({ extended: true }))
//? Determine where static files will come from
app.use(express.static(path.join(rootDir, 'public')))

app.use(
    session(
        {
            secret: 'a secret',
            resave: false,
            saveUninitialized: false,
            store: store,
        })
)

// * We need to create a mongoose model of our user
// * The user stored in the session is JUST an object NOT mongoose model
app.use((req, res, next) => {
    if (!req.session.user) {
        return next()
    }
    User.findById(req.session.user._id)
        .then(user => {
            req.user = user
            next()
        })
        .catch(err => console.log(err))
})


// putting a /argument here will only run if the url is /admin/*something*
app.use('/admin', adminRoutes)
app.use(shopRoutes)
app.use(authRoutes)

// Any other routes not matching
app.use(errorController.get404)

mongoose.connect(process.env.MONGODB_URI)
    .then(result => {
        app.listen(3000)
        console.log('Connected!')

    }).catch(err => console.log(err))