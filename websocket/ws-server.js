const WebSocket = require('ws');

let wss = null;

function init(server) {
  wss = new WebSocket.Server({ server });

  wss.on('connection', function connection(ws) {
    console.log('WebSocket client connected');
    ws.on('message', function incoming(message) {
      console.log('Received from client:', message.toString());
      let response = { "extension": message.toString() }
      ws.send(JSON.stringify(response));
    });
  });
}

function broadcast(message) {
  if (!wss) return;
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

module.exports = { init, broadcast };