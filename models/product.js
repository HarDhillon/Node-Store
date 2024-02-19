const mongodb = require('mongodb')
const getDb = require("../util/database").getDb

class Product {
    constructor(title, price, description, imageUrl) {
        this.title = title
        this.price = price
        this.description = description
        this.imageUrl = imageUrl
    }

    save() {

        const db = getDb()
        return db.collection('products').insertOne(this)
            .then(result => {
                console.log(result)
            })
            .catch(err => console.log(err))
    }

    static fetchAll() {
        const db = getDb()
        // ? Find returns a cursor
        return db.collection('products').find().toArray()
            .then(products => {
                console.log(products)
                return products
            })
            .catch(err => console.log(err))
    }

    static findById(prodId) {
        const db = getDb()
        //? find will always return a cursor even if we find just one item so rather than use find().next() we can use findOne()
        // * Id's are stored in a unique way in MongoDB so you need to convert your regular ID into an Object ID
        return db.collection('products').findOne({ _id: new mongodb.ObjectId(prodId) })
            .then(product => {
                return product
            })
            .catch(err => console.log(err))
    }
}

module.exports = Product