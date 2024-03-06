const Product = require('../models/product')
const fileHelper = require('../util/file')

const { validationResult } = require('express-validator')

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add product',
        path: '/admin/add-product',
        editing: null,
        hasError: false,
        errorMessage: null,
        validationErrors: []
    })
}

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title
    const image = req.file
    const price = req.body.price
    const description = req.body.description

    const errors = validationResult(req)

    // If image is rejected by multer
    if (!image) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add product',
            path: '/admin/edit-product',
            editing: false,
            hasError: true,
            product: {
                title,
                price,
                description
            },
            errorMessage: "Attached file is not an image",
            validationErrors: []
        })
    }

    // If we have validation errors
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add product',
            path: '/admin/edit-product',
            editing: false,
            hasError: true,
            product: {
                title,
                price,
                description
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        })
    }

    const imageUrl = image.path

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
            const error = new Error(err)
            error.httpStatusCode = 500
            // * Passing next an error object lets it know an error has occured
            return next(error)
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
                hasError: false,
                errorMessage: null,
                validationErrors: []
            })
        })
        .catch(err => {
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })

}

exports.postEditProduct = (req, res, next) => {
    const { productId, title, price, description } = req.body;
    const image = req.file

    const errors = validationResult(req)

    // If we have validation errors
    if (!errors.isEmpty()) {
        console.log(errors.array())
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit product',
            path: '/admin/edit-product',
            editing: true,
            hasError: true,
            product: {
                title,
                price,
                description,
                _id: productId
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        })
    }

    Product.findById(productId)
        .then(product => {
            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/')
            }
            product.title = title
            product.price = price
            product.description = description
            // Only update imageUrl is new image was provided
            if (image) {
                // Delete old image
                fileHelper.deleteFile(product.imageUrl)
                product.imageUrl = image.path
            }

            return product.save()
                .then(result => {
                    console.log("Product Updated")
                    res.redirect('/admin/products')
                })
        })
        .catch(err => console.log(err))
}

exports.deleteProduct = (req, res, next) => {

    // Delete image if we are deleting product
    const prodId = req.params.productId
    Product.findById(prodId)
        .then(product => {
            if (!product) {
                return next(new Error('Product now found'))
            }
            fileHelper.deleteFile(product.imageUrl)

            // Once file is deleted we can delete from DB
            return Product.deleteOne({ _id: prodId, userId: req.user._id })
        })
        .then(result => {
            console.log("Removed product")
            res.status(200).json({ message: 'Success!' })
        })
        .catch(err => {
            res.status(500).json({ message: 'Deleting failed!' })
        })

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