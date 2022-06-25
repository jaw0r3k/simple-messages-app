let messages = []
const { createServer } = require('http');
const { parse }  = require('url');
const { WebSocketServer } = require('ws');
const fs = require("fs")
const server = createServer(function(req, res){
  fs.readFile('public/index.html', function (err, data){
    console.log(err)
    res.writeHead(200, {'Content-Type': 'text/html','Content-Length': data.length});
    res.write(data);
    res.end();
});});
const wss = new WebSocketServer({ noServer: true }); 
wss.on('connection', function connection(ws) {
  ws.send(JSON.stringify(messages))
  ws.on('message', function message(data) {
    console.log('received: %s', data);
    const obj = JSON.parse(data)
    messages.push(obj)
    wss.clients.forEach(c => {
       c.send(JSON.stringify({ author: obj.author, message: obj.message}))
    })
  });
});


server.on('upgrade', function upgrade(request, socket, head) {
  const { pathname } = parse(request.url);

  if (pathname === '/websocket') {
    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

server.listen(process.env.PORT ?? 8080);