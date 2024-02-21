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

    getCart() {
        const db = getDb()

        // fetch all product id's in user collection
        const productIds = this.cart.items.map(i => {
            return i.productId
        })
        // find all elements in products where _id is in the array (returns cursor)
        return db.collection('products')
            .find({ _id: { $in: productIds } })
            .toArray()
            .then(products => {
                return products.map(p => {
                    // return the product details and add quantity by matching the id to user cart items where quantity is stored
                    return {
                        // ? find that product in user document
                        ...p, quantity: this.cart.items.find(i => {
                            return i.productId.toString() === p._id.toString()
                        }).quantity
                    }
                })
            })
    }

    deleteItemFromCart(prodId) {
        const db = getDb()

        // Return array without the deleted item
        const updatedCartItems = this.cart.items.filter(item => {
            return item.productId.toString() !== prodId.toString()
        })

        return db.collection('users').updateOne(
            { _id: new mongodb.ObjectId(this._id) },
            { $set: { cart: { items: updatedCartItems } } }
        )

    }

    addOrder() {
        const db = getDb();
        // Reuse getCart to get enriched product information rather than just their id
        return this.getCart()
            .then(produts => {
                const order = {
                    items: produts,
                    user: {
                        _id: new mongodb.ObjectId(this._id),
                        name: this.name,
                        email: this.email
                    }
                }
                return db.collection('orders').insertOne(order)
            })
            // Once successfully inserted order, update cart
            .then(result => {
                // update local User cart to empty
                this.cart = { items: [] }

                // Update cart in database to empty
                return db.collection('users').updateOne(
                    { _id: new mongodb.ObjectId(this._id) },
                    { $set: { cart: { items: [] } } }
                )
            })
            .catch(err => console.log())
    }

    getOrders() {
        const db = getDb()

        return db.collection('orders').find({ "user._id": new mongodb.ObjectId(this._id) }).toArray()
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