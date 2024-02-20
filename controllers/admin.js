const Product = require('../models/product')

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add product',
        path: '/admin/add-product',
        editing: null,
    })
}

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title
    const imageUrl = req.body.imageUrl
    const price = req.body.price
    const description = req.body.description
    // Because of our associations we can create a product linked to this user through this method
    const product = new Product(title, price, description, imageUrl)
    product.save()
        .then(result => {
            console.log("Product Created")
            res.redirect('/admin/products')
        })
        .catch(err => {
            console.log(err)
        })
}

// exports.getEditProduct = (req, res, next) => {
//     // Fetch query param
//     const editMode = req.query.edit;
//     if (!editMode) {
//         res.redirect('/')
//     }
//     const prodId = req.params.productId

//     // Fetch only products related to the user
//     req.user
//         .getProducts({ where: { id: prodId } })
//         .then(products => {
//             const product = products[0]
//             res.render('admin/edit-product', {
//                 pageTitle: 'Edit product',
//                 path: '/admin/edit-product',
//                 editing: editMode,
//                 product: product
//             })
//         })
//         .catch(err => console.log(err))

// }

// exports.postEditProduct = (req, res, next) => {
//     const prodId = req.body.productId
//     const updatedTitle = req.body.title
//     const updatedPrice = req.body.price
//     const updatedImageUrl = req.body.imageUrl
//     const updatedDescription = req.body.description

//     Product.findByPk(prodId)
//         .then(product => {
//             product.title = updatedTitle;
//             product.price = updatedPrice;
//             product.imageUrl = updatedImageUrl
//             product.description = updatedDescription
//             // save will execute sequilize for us
//             return product.save()
//         })
//         .then(result => {
//             console.log("Product Updated")
//             res.redirect('/admin/products')
//         })
//         .catch(err => console.log(err))

// }

// exports.postDeleteProduct = (req, res, next) => {
//     const prodId = req.body.productId
//     Product.findByPk(prodId)
//         .then(product => {
//             return product.destroy()
//         })
//         .then(result => {
//             console.log("Removed product")
//             res.redirect('/admin/products')
//         })
//         .catch(err => console.log(err))
// }

exports.getProducts = (req, res, next) => {
    // Show only products that belong to the user
    Product.fetchAll()
        .then(products => {
            res.render('admin/products', {
                prods: products,
                pageTitle: 'Admin Products',
                path: "/admin/products",
            })
        })
        .catch(err => console.log(err))

}