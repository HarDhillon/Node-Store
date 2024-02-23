require('dotenv').config();

const express = require('express')
const mongoose = require('mongoose')


const path = require('path')
const rootDir = require('./util/path')
const app = express()

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop');

const errorController = require('./controllers/error');

const User = require('./models/user')


app.set('view engine', 'ejs');
//? bodyParser is now part of express so we can actually just do this
app.use(express.urlencoded({ extended: true }))
//? Determine where static files will come from
app.use(express.static(path.join(rootDir, 'public')))

app.use((req, res, next) => {
    User.findById("65d8768571936d2f30a8eb20")
        .then(user => {
            req.user = user
            next()
        })
        .catch(err => console.log(err))
})

// putting a /argument here will only run if the url is /admin/*something*
app.use('/admin', adminRoutes)
app.use(shopRoutes)

// Any other routes not matching
app.use(errorController.get404)

mongoose.connect(process.env.MONGODB_URI)
    .then(result => {
        // findOne() returns first user if no args given
        User.findOne()
            .then(user => {
                if (!user) {
                    const user = new User({
                        name: 'Har',
                        email: 'test@email.com',
                        cart: {
                            items: []
                        }
                    })
                    user.save()
                }
            })
        app.listen(3000)
        console.log('Connected!')

    }).catch(err => console.log(err))