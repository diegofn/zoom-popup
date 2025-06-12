const WebSocket = require('ws');
require('dotenv').config({ path: '.env' });

//
// Variables
//
const ZOOM_WSS_URL = process.env.ZOOM_WSS_URL;
const ZOOM_PHONE_EXTENSION = process.env.ZOOM_PHONE_EXTENSION;

//
// Cambia la URL si tu servidor está en otro host o puerto
//
const ws = new WebSocket(ZOOM_WSS_URL);

ws.on('open', function open() {
  console.log('Conectado al servidor WebSocket');
  ws.send('Ext: ' + ZOOM_PHONE_EXTENSION);
});

ws.on('message', function incoming(data) {
  console.log('Mensaje recibido del servidor:', data.toString());
});

ws.on('close', function close() {
  console.log('Desconectado del servidor WebSocket');
});

ws.on('error', function error(err) {
  console.error('Error en WebSocket:', err);
});