const Product = require('../models/product')
const Order = require('../models/order')
const fs = require('fs')
const path = require('path')

const PDFDocument = require('pdfkit')

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
                path: '/products',
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
                products: products,

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
                    email: req.user.email,
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
    Order.find({ "user.userId": req.user._id })
        .then(orders => {
            res.render('shop/orders', {
                path: '/orders',
                pageTitle: 'Your Orders',
                orders: orders,

            })
        })
        .catch(err => console.log(err))
};

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId

    Order.findById(orderId)
        .then(order => {

            if (!order) {
                return next(new Error('No order found'))
            }
            // If order user is NOT same as session user
            if (order.user.userId.toString() !== req.user._id.toString()) {
                return next(new Error('Unauthorized'))
            }

            const invoiceName = 'invoice-' + orderId + '.pdf'
            const invoicePath = path.join('invoices', invoiceName)

            // Create PDF of our invoice
            const pdfDoc = new PDFDocument()

            // Set Headers so browser knows file type and open behaviour
            res.setHeader('Content-Type', 'application/pdf')
            res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"')

            pdfDoc.pipe(fs.createWriteStream(invoicePath))
            pdfDoc.pipe(res)

            // Title
            pdfDoc.fontSize(26).text("Invoice", {
                underline: true
            })

            pdfDoc.text('--------------')

            let totalPrice = 0

            // Write out each product with quantity + price and add order total
            order.products.forEach(prod => {
                totalPrice += totalPrice + prod.quantity * prod.product.price
                pdfDoc.fontSize(14).text(prod.product.title + ' - ' + prod.quantity + ' x ' + '$' + prod.product.price)
            })
            pdfDoc.text(` `)
            pdfDoc.text(` `)
            pdfDoc.fontSize(20).text(`Total Price: ${totalPrice}`)

            pdfDoc.end()

        })
        .catch(err => next(err))

}