const mongodb = require('mongodb')
const getDb = require("../util/database").getDb

class Product {
    constructor(title, price, description, imageUrl, id, userId) {
        this.title = title
        this.price = price
        this.description = description
        this.imageUrl = imageUrl
        this._id = id ? new mongodb.ObjectId(id) : null
        this.userId = userId
    }

    save() {
        const db = getDb()
        let dbOp;

        // If ID passed to Product model we will want to update an existing rather than save
        if (this._id) {
            // ? updateOne needs to be told where to find the item being updated AND what to update. In this case, everything.
            dbOp = db.collection('products').updateOne({ _id: this._id }, { $set: this })
        } else {
            dbOp = db.collection('products').insertOne(this)
        }

        return dbOp.then(result => {
            // console.log(result)
        })
            .catch(err => console.log(err))
    }

    static fetchAll() {
        const db = getDb()
        // ? Find returns a cursor
        return db.collection('products').find().toArray()
            .then(products => {
                // console.log(products)
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

    static deleteById(prodId) {
        const db = getDb()

        return db.collection('products').deleteOne({ _id: new mongodb.ObjectId(prodId) })
            .then(result => {
                console.log("Deleted Product")
            })
            .catch(err => console.log(err))
    }
}

module.exports = Product