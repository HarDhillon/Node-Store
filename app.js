const express = require('express')
const path = require('path')
const rootDir = require('./util/path')
const app = express()

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error');

const sequelize = require('./util/database')
const Product = require('./models/product')
const User = require('./models/user')
const Cart = require('./models/cart')
const CartItem = require('./models/cart-item')

app.set('view engine', 'ejs');
// bodyParser is now part of express so we can actually just do this
app.use(express.urlencoded({ extended: true }))
// Determine where static files will come from
app.use(express.static(path.join(rootDir, 'public')))

// Store our sequelize object in our request.
app.use((req, res, next) => {
    User.findByPk(1)
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

Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' })
User.hasMany(Product)
User.hasOne(Cart)
Cart.belongsTo(User)
// * We need to tell sequelize how they are connected
Cart.belongsToMany(Product, { through: CartItem })
Product.belongsToMany(Cart, { through: CartItem })

sequelize.
    // ! force:true will overide database
    // sync({ force: true })
    sync()
    .then(result => {
        return User.findByPk(1)
    })
    .then(user => {
        if (!user) {
            return User.create({ name: 'Har', email: 'test@email.com' })
        }
        // * Returning a value in a then block automatically wrapped in a new promise
        return user;
    })
    .then(user => {
        return user.createCart();
    })
    .then(cart => {
        app.listen(3000)
    })
    .catch(err => {
        console.log(err)
    })
