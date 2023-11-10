
const http = require('http');
const express = require('express')

const app = express()

app.use((req, res, next) => {
    console.log('In the middleware!')
    // next sends us to the next middleware
    next();
})
app.use((req, res, next) => {
    console.log('In another middleware!')
    res.send('<h1>hello from express</h1>');
})

const server = http.createServer(app)

server.listen(3000)