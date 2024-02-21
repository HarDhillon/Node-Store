const mongodb = require('mongodb')
const getDb = require("../util/database").getDb

class User {
    constructor(username, email, cart, id) {
        this.name = username
        this.email = email
        this.cart = cart // {items: []}
        this._id = id
    }

    save() {
        const db = getDb()

        return db.collection('users').insertOne(this)
    }

    addToCart(product) {

        // if existing product id found in cart, will return its index (0 or more)
        const cartProductIndex = this.cart.items.findIndex(cp => {
            // * The retrieved id from the product collection is not actually a string
            return cp.productId.toString() === product._id.toString()
        })

        let newQuantity = 1
        const updatedCartItems = [...this.cart.items]

        // If product exists, increase quantity by 1 and update in the array
        if (cartProductIndex >= 0) {
            newQuantity = this.cart.items[cartProductIndex].quantity + 1
            updatedCartItems[cartProductIndex].quantity = newQuantity
            // else push new item into array
        } else {
            updatedCartItems.push({
                productId: new mongodb.ObjectId(product._id),
                quantity: newQuantity
            })
        }

        const updatedCart = {
            items: updatedCartItems
        }

        const db = getDb()

        return db.collection('users').updateOne(
            { _id: new mongodb.ObjectId(this._id) },
            { $set: { cart: updatedCart } })
    }

    static findById(userId) {
        const db = getDb()

        return db.collection('users').findOne({ _id: new mongodb.ObjectId(userId) })
            .then(user => {
                return user
            })
            .catch(err => console.log(err))
    }
}

module.exports = User