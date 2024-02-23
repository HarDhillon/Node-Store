const Product = require('../models/product')
const Order = require('../models/order')

exports.getProducts = (req, res, next) => {
    Product.find()
        .then(products => {
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'Shop',
                path: "/products",
                hasProducts: products.length > 0,
                activeShop: true,
                productCSS: true,
            })
        })
        .catch(err => {
            console.log(err)
        });
}

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId

    Product.findById(prodId)
        .then(product => {
            res.render('shop/product-detail', {
                product: product,
                pageTitle: product.title,
                path: '/products'
            })
        })
        .catch(err => console.log(err))
}

exports.getIndex = (req, res, next) => {
    Product.find()
        .then(products => {
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                path: "/",
                hasProducts: products.length > 0,
                activeShop: true,
                productCSS: true,
            })
        })
        .catch(err => {
            console.log(err)
        });
}

exports.getCart = (req, res, next) => {

    req.user
        .populate('cart.items.productId')
        .then(user => {
            // console.log(user.cart.items[0].productId)
            const products = user.cart.items

            res.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Your Cart',
                products: products
            });
        })
};

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId

    Product.findById(prodId)
        .then(product => {
            return req.user.addToCart(product)
        })
        .then(result => {
            res.redirect('/cart')
        })
        .catch(err => console.log(err))
}

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId

    req.user.removeFromCart(prodId)
        .then(result => {
            res.redirect('/cart')
        })
        .catch(err => console.log(err))
}

exports.postOrder = (req, res, next) => {

    req.user
        .populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items.map(p => {
                // Mongoose will only give us the ID even though productId contains a lot of data. We need to spread it.
                return { quantity: p.quantity, product: { ...p.productId } }
            })

            const order = new Order({
                user: {
                    name: req.user.name,
                    userId: req.user
                },
                products: products
            })
            return order.save()
        })
        .then(result => {
            req.user.clearCart()
        })
        .then(result => {
            res.redirect('/orders')
        })
        .catch(err => console.log(err))
}

exports.getOrders = (req, res, next) => {
    req.user.getOrders()
        .then(orders => {
            res.render('shop/orders', {
                path: '/orders',
                pageTitle: 'Your Orders',
                orders: orders
            })
        })
        .catch(err => console.log(err))
};