const http = require('http')

const server = http.createServer((req, res) => {
    const url = req.url;
    const method = req.method;

    if (url === "/") {
        res.setHeader('Content-Type', 'text/html')
        res.write('<html>');
        res.write('<head><title>My First Page</title></head>');
        res.write('<body><h1>Welcome to my page</h1></ul>');
        res.write('<br/>')
        res.write('<form action="/create-user" method="POST"><input type="text" name="username" /><button type="submit">Send</button></form>')
        res.write("</body>")
        res.write('</html>');
        return res.end()
    }
    if (url === "/users") {
        res.write('<html>');
        res.write('<head><title>My First Page</title></head>');
        res.write('<body><ul><li>User1</li><li>User2</li><li>User3</li></ul>');
        res.write("</body>")
        res.write('</html>');
    }

    if (url === "/create-user" && method === "POST") {
        const body = []
        req.on('data', (chunk) => {
            body.push(chunk)
        });
        return req.on('end', () => {
            const parsedBody = Buffer.concat(body).toString();
            console.log(parsedBody.split("=")[1])
            res.statusCode = 302
            res.setHeader('Location', '/')
            return res.end()
        })
    }

})

server.listen(3000)