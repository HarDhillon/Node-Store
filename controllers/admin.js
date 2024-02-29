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
    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        userId: req.user._id
    })
    product.save()
        .then(result => {
            console.log("Product Created")
            res.redirect('/admin/products')
        })
        .catch(err => {
            console.log(err)
        })
}

exports.getEditProduct = (req, res, next) => {
    // Fetch query param
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/')
    }
    const prodId = req.params.productId

    // Fetch only products related to the user
    Product.findById(prodId)
        .then(product => {
            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/')
            }
            res.render('admin/edit-product', {
                pageTitle: 'Edit product',
                path: '/admin/edit-product',
                editing: editMode,
                product: product,
            })
        })
        .catch(err => console.log(err))

}

exports.postEditProduct = (req, res, next) => {
    const { productId, title, imageUrl, price, description } = req.body;

    Product.findById(productId)
        .then(product => {
            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/')
            }
            product.title = title
            product.imageUrl = imageUrl
            product.price = price
            product.description = description

            return product.save()
                .then(result => {
                    console.log("Product Updated")
                    res.redirect('/admin/products')
                })
        })
        .catch(err => console.log(err))
}

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId
    Product.deleteOne({ _id: prodId, userId: req.user._id })
        .then(result => {
            console.log("Removed product")
            res.redirect('/admin/products')
        })
        .catch(err => console.log(err))
}

exports.getProducts = (req, res, next) => {
    // Show only products that belong to the user
    Product.find({ userId: req.user._id })
        // * Populate can fetch related data. Rather than just giving the user id you can fetch ALL user data. 
        // * This is thanks to our ref: in our models
        .populate('userId')
        .then(products => {
            res.render('admin/products', {
                prods: products,
                pageTitle: 'Admin Products',
                path: "/admin/products",
            })
        })
        .catch(err => console.log(err))

}