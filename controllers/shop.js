const Product = require('../models/product')
const Cart = require('../models/cart')

exports.getProducts = (req, res, next) => {
    Product.fetchAll()
        .then(([rows, fieldData]) => {
            res.render('shop/product-list', {
                prods: rows,
                pageTitle: 'Shop',
                path: "/products",
            })
        })
        .catch(err => console.log(err))
}

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId
    Product.findById(prodId)
        .then(([product]) => {
            res.render('shop/product-detail', {
                product: product[0],
                pageTitle: product.title,
                path: '/products'
            })
        })
        .catch(err => console.log(err))
}

exports.getIndex = (req, res, next) => {
    Product.fetchAll()
        .then(([rows, fieldData]) => {
            res.render('shop/index', {
                prods: rows,
                pageTitle: 'Shop',
                path: "/",
                hasProducts: rows.length > 0,
                activeShop: true,
                productCSS: true,
            })
        })
        .catch(err => console.log(err))
}

exports.getCart = (req, res, next) => {
    Cart.getCart(cart => {
        // We want all the information about the product that is in the cart, so we check the product model as well
        Product.fetchAll(products => {
            const cartProducts = []

            for (product of products) {
                // Get the data of the product from cart (to get quantity)
                const cartProductData = cart.products.find(prod => prod.id === product.id)
                // check what products are in the cart
                if (cart.products.find(prod => prod.id === product.id)) {
                    cartProducts.push({ productData: product, qty: cartProductData.qty })
                }
            }
            res.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Your Cart',
                products: cartProducts
            });
        })

    })

};

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId
    Product.findById(prodId, (product) => {
        Cart.addProduct(prodId, product.price)
    })
    res.redirect('/cart')
}

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId
    Product.findById(prodId, product => {
        Cart.deleteProduct(prodId, product.price)
        res.redirect('/cart')
    })
}

exports.getOrders = (req, res, next) => {
    res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders'
    });
};

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout'
    })
}
