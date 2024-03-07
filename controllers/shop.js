require('dotenv').config();

const Product = require('../models/product')
const Order = require('../models/order')
const fs = require('fs')
const path = require('path')

const stripe = require("stripe")(process.env.STRIPE_SECRET);

const PDFDocument = require('pdfkit')

const ITEMS_PER_PAGE = 2

exports.getProducts = (req, res, next) => {
    const page = +req.query.page || 1
    let totalItems;

    Product.find().countDocuments().then(numberOfProducts => {
        totalItems = numberOfProducts

        return Product.find().skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE)
    })
        .then(products => {
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'Products',
                path: "/products",
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
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
    const page = +req.query.page || 1
    let totalItems;

    Product.find().countDocuments().then(numberOfProducts => {
        totalItems = numberOfProducts

        return Product.find().skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE)
    })
        .then(products => {
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                path: "/",
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
            })
        })
        .catch(err => {
            next(err)
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

exports.getCheckout = (req, res, next) => {
    let products
    let total = 0

    req.user
        .populate('cart.items.productId')
        .then(user => {

            products = user.cart.items

            products.forEach(p => {
                total += p.quantity * p.productId.price
            })

            return stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                mode: "payment",
                line_items: products.map((p) => {
                    return {
                        quantity: p.quantity,
                        price_data: {
                            currency: "gbp",
                            unit_amount: p.productId.price * 100,
                            product_data: {
                                name: p.productId.title,
                                description: p.productId.description,
                            },
                        },
                    };
                }),
                customer_email: req.user.email,
                success_url:
                    req.protocol + "://" + req.get("host") + "/checkout/success",
                cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel",
            });
        })
        .then((session) => {
            res.render("shop/checkout", {
                path: "/checkout",
                pageTitle: "Checkout",
                products: products,
                totalSum: total,
                sessionId: session.id,
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.getCheckoutSuccess = (req, res, next) => {

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