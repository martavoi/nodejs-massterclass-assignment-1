const http = require('http');
const url = require('url')

const handlers = {
    '/hello': {
        post: (payload) => {
            if(typeof(payload.name) === 'string')
            {
                return {
                    code: 200,
                    response : {
                        message: 'Hello ' + payload.name + '!'
                    }
                }
            }
        }
    }
}

const httpServer = http.createServer(function(req, res){
    const method = req.method.toLowerCase();
    const path = url.parse(req.url).pathname;
    const trimmedPath = path.replace(/\/$/, '').toLowerCase();

    const handlersSet = handlers[trimmedPath];
    if (typeof(handlersSet) != 'object' || typeof(handlersSet[method]) != 'function'){
        res.writeHead(404, 'Route Not Found');
        res.end();
        return;
    }

    let body = [];
    req.on('data', chunk => {
        body.push(chunk);
    }).on('end', () => {
        body = Buffer.concat(body).toString();
        let payload = {};
        if(body.length){
            try{
                payload = JSON.parse(body);
            } catch(e){
                res.writeHead(400, 'Invalid JSON');
                res.end();
                return;
            }
        }
        
        const handler = handlersSet[method];
        const { code, response} = handler(payload);

        res.setHeader('Content-Type', 'application/json');
        res.writeHead(code);
        res.end(JSON.stringify(response));
    })    
});
httpServer.listen(5000);