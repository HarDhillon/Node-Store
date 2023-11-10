const express = require('express')

const app = express()

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')
const notFoundRoutes = require('./routes/404')

// bodyParser is now part of express so we can actually just do this
app.use(express.urlencoded({ extended: true }))

// putting a /argument here will only run if the url is /admin/*something*
app.use('/admin', adminRoutes)
app.use(shopRoutes)

app.use(notFoundRoutes)

app.listen(3000)