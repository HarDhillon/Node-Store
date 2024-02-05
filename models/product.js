const db = require('../util/database')
const Cart = require('./cart')

module.exports = class Product {
    constructor(id, title, imageUrl, description, price) {
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price
    }

    save() {

    }

    // static methods get called on an a class object not an object. So you call it as Product.method

    // By passing a callback - we ensure that the function doesnt run until the file is read
    static fetchAll() {
        return db.execute('SELECT * FROM products')
    }

    static findById(id) {

    }

    static deleteById(id) {

    }
}