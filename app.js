const express = require('express')
const path = require('path')
const rootDir = require('./util/path')
const app = express()
app.set('view engine', 'ejs');
const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error');

// bodyParser is now part of express so we can actually just do this
app.use(express.urlencoded({ extended: true }))

app.use(express.static(path.join(rootDir, 'public')))

// putting a /argument here will only run if the url is /admin/*something*
app.use('/admin', adminRoutes)
app.use(shopRoutes)

// Any other routes not matching
app.use(errorController.get404)

app.listen(3000)