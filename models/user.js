// const mongodb = require('mongodb')
// const getDb = require("../util/database").getDb

const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    cart: {
        items: [
            {
                productId: { type: Schema.Types.ObjectId, required: true, ref: 'Product' },
                quantity: { type: Number, required: true }
            }
        ]
    }
})

module.exports = mongoose.model('User', userSchema)