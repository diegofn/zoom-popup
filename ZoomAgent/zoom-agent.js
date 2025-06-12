const { json } = require('body-parser');
const WebSocket = require('ws');
const { exec } = require('child_process');
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
    ws.send(ZOOM_PHONE_EXTENSION);
});

ws.on('message', function incoming(data) {
    console.log('Mensaje recibido del servidor:', data.toString());

    //
    // Procesa el mensaje recibido validando la URL
    //
    let message = JSON.parse(data.toString());
    if (message.extension ) {
        if (String(message.extension) === ZOOM_PHONE_EXTENSION) {
            console.log('Mensaje para la extensión:', message.extension);
            if (message.url) {
                console.log('URL de popup:', message.url);
                command = `start "" "${message.url}"`;
                exec(command);
            }
        }
    } else {
        console.log('No se recibió un mensaje correcto');
    }

    
});

ws.on('close', function close() {
    console.log('Desconectado del servidor WebSocket');
});

ws.on('error', function error(err) {
    console.error('Error en WebSocket:', err);
});