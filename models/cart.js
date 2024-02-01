const fs = require('fs')
const path = require('path')

// Path to cart data
const p = path.join(path.dirname(require.main.filename), 'data', 'cart.json');

module.exports = class Cart {

    static addProduct(id, productPrice) {
        // Create cart object and add cart objects to it if already exist
        fs.readFile(p, (err, fileContent) => {
            let cart = { products: [], totalPrice: 0 }
            if (!err) {
                cart = JSON.parse(fileContent)
            }
            // Check if product has been added to cart before
            const existingProductIndex = cart.products.findIndex(prod => prod.id === id)
            const existingProduct = cart.products[existingProductIndex]
            let updatedProduct;
            // If product is already in cart
            if (existingProduct) {
                // Create new object to replace old object
                updatedProduct = { ...existingProduct }
                // update product quantity
                updatedProduct.qty = updatedProduct.qty + 1
                // Replace old product with new updated product
                cart.products = [...cart.products]
                cart.products[existingProductIndex] = updatedProduct
            }
            // Otherwise create new object in cart
            else {
                updatedProduct = { id: id, qty: 1 };
                cart.products = [...cart.products, updatedProduct]
            }
            // Update total price
            cart.totalPrice = cart.totalPrice + +productPrice
            // Update cart data
            fs.writeFile(p, JSON.stringify(cart), err => {
                console.log(err)
            })
        })
    }

    static deleteProduct(id, productPrice) {
        fs.readFile(p, (err, fileContent) => {
            if (err) {
                return
            }
            const updatedCart = { ...JSON.parse(fileContent) };
            const product = updatedCart.products.find(prod => prod.id === id)
            // When product is deleted that is not in cart, product wont be found in cart. This will throw error so return if product doesnt exist
            if (!product) {
                return
            }
            const productQty = product.qty;
            // Remove items from cart
            updatedCart.products = updatedCart.products.filter(prod => prod.id !== id)
            // Remove total price from cart
            updatedCart.totalPrice = updatedCart.totalPrice - productPrice * productQty

            fs.writeFile(p, JSON.stringify(updatedCart), err => {
                console.log(err)
            })
        })
    }

    static getCart(cb) {
        fs.readFile(p, (err, fileContent) => {
            const cart = JSON.parse(fileContent)
            if (err) {
                cb(null)
            } else {
                cb(cart)
            }
        })
    }

}