//
// Required modules
//
"use strict";

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http');
const wsServer = require('./websocket/ws-server');
require('dotenv').config({ path: '.env' });

//
// Map the routes
//
const zoomRoute = require('./routes/Zoom');

//
// Encoding bodies support
//
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/Zoom', zoomRoute);

//
// Set the consts
//
const port = process.env.PORT || 3000;
const ZOOM_WEBHOOK_SECRET_TOKEN = process.env.ZOOM_WEBHOOK_SECRET_TOKEN;
if (!ZOOM_WEBHOOK_SECRET_TOKEN) {
    console.error("Missing required environment variables.");
    process.exit(1);
}

//
// Public folder
//
app.use(express.static('public'));


//
// Create a WebSocket server
//
const server = http.createServer(app);
wsServer.init(server); 

//
// Start the webservice 
//
server.listen(port, function() {
    console.log('Listening on port %d', server.address().port);
});

