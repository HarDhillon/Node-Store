const fs = require('fs')
const path = require('path')

module.exports = class Product {
    constructor(t) {
        this.title = t;
    }

    save() {
        // path to our file with the products
        const p = path.join(path.dirname(require.main.filename), 'data', 'products.json');

        fs.readFile(p, (err, fileConent) => {
            let products = []
            // Grab all the products from the file if no error
            if (!err) {
                products = JSON.parse(fileConent)
            }
            // add the created instance of the class to the end of the other products (if they exist)
            products.push(this)
            // Write the latest array of products to file
            fs.writeFile(p, JSON.stringify(products), (err) => {
                console.log(err)
            })
        })
    }

    // By passing a callback - we ensure that the function doesnt run until the file is read
    static fetchAll(cb) {

        const p = path.join(path.dirname(require.main.filename), 'data', 'products.json');


        fs.readFile(p, (err, fileConent) => {
            if (err) {
                cb([])
            }
            cb(JSON.parse(fileConent))
        })
    }
}