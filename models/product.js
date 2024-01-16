const fs = require('fs')
const path = require('path')

const getProductsFromFile = cb => {
    const p = path.join(path.dirname(require.main.filename), 'data', 'products.json');

    // Calling "cb" is esentially calling the res.render but ensuring we have products that have been fetche
    fs.readFile(p, (err, fileConent) => {
        if (err) {
            return cb([])
        }
        cb(JSON.parse(fileConent))
    })
}

module.exports = class Product {
    constructor(title, imageUrl, description, price) {
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price
    }

    save() {
        this.id = Math.random().toString()
        // path to our file with the products
        const p = path.join(path.dirname(require.main.filename), 'data', 'products.json');

        getProductsFromFile(products => {
            products.push(this)
            // Write the latest array of products to file
            fs.writeFile(p, JSON.stringify(products), (err) => {
                console.log(err)
            })
        })
    }

    // static methods get called on an a class object not an object. So you call it as Product.method

    // By passing a callback - we ensure that the function doesnt run until the file is read
    static fetchAll(cb) {
        getProductsFromFile(cb)
    }

    static findById(id, cb) {
        getProductsFromFile(products => {
            const product = products.find(p => p.id === id)
            cb(product)
        })
    }
}