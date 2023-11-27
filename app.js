const express = require('express')

const path = require('path')
const rootDir = require('./util/path')

const app = express()

app.set('view engine', 'pug');
app.set()

const adminData = require('./routes/admin')
const shopRoutes = require('./routes/shop')

// bodyParser is now part of express so we can actually just do this
app.use(express.urlencoded({ extended: true }))

app.use(express.static(path.join(rootDir, 'public')))

// putting a /argument here will only run if the url is /admin/*something*
app.use('/admin', adminData.routes)
app.use(shopRoutes)

// Any other routes not matching
app.use((req, res, next) => {
    res.render('404', { pageTitle: 'Page not found' })
})

app.listen(3000)