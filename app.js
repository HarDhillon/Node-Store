const express = require('express')

const app = express()

// bodyParser is now part of express so we can actually just do this
app.use(express.urlencoded({ extended: false }))

app.use('/add-product', (req, res, next) => {
    // next sends us to the next middleware
    res.send('<form action="/product" method="POST"> <input type="text" name="title" /> <button type="submit">Add Product</button> </form>');
})

app.post('/product', (req, res, next) => {
    console.log(req.body)
    res.redirect('/')
})

app.use((req, res, next) => {
    res.send('<h1>hello from express</h1>');
})
app.listen(3000)