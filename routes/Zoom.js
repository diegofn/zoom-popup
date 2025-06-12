const express = require('express');
const crypto = require('crypto');
const { broadcast } = require('../websocket/ws-server');

require('dotenv').config({ path: '.env' });
const ZOOM_WEBHOOK_SECRET_TOKEN = process.env.ZOOM_WEBHOOK_SECRET_TOKEN;
const ZOOM_EXTENSION_NUMBERS = process.env.ZOOM_EXTENSION_NUMBERS;
const ZOOM_PHONE_POPUP_URL = process.env.ZOOM_PHONE_POPUP_URL;

const router = express.Router();

//
// Zoom / for Zoom Integration
//
router.get('/', async function(req, res){
    res.status(200)
    res.send(`Zoom Webhook successfully running`)  
});
//
// POST / for Zoom Integration
//
router.post('/', async function(req, res){
    try {

        //
        // Construct the message string
        // 
        const message = `v0:${req.headers['x-zm-request-timestamp']}:${JSON.stringify(req.body)}`
        const hashForVerify = crypto.createHmac('sha256', ZOOM_WEBHOOK_SECRET_TOKEN).update(message).digest('hex')

        //
        // hash the message string with your Webhook Secret Token and prepend the version semantic
        //
        const signature = `v0=${hashForVerify}`

        if (req.headers['x-zm-signature'] === signature) {

            //
            // Zoom validating you control the webhook endpoint 
            //
            if(req.body.event === 'endpoint.url_validation') {
                const hashForValidate = crypto.createHmac('sha256', process.env.ZOOM_WEBHOOK_SECRET_TOKEN).update(req.body.payload.plainToken).digest('hex')

                response = {
                    message: {
                        plainToken: req.body.payload.plainToken,
                        encryptedToken: hashForValidate
                    },
                    status: 200
                }

                console.log(response.message)

                res.status(response.status)
                res.json(response.message)
            } else {

                //
                // Zoom sending the event to your endpoint
                //
                if (req.body){
                    const data = req.body;
                    
                    //
                    // New meeting event
                    //
                    if (data.event == null){
                      console.log("Reveived body empty request");
                      res.sendStatus(200);
                      return;
                    }
                      
                    console.log (`========== New Zoom Event: ${data.event} ==========`);
                    if (data.event == "phone.callee_answered"){

                        console.log (`call_id: ${data.payload.object.call_id}`);
                        console.log (`phone_number: ${data.payload.object.caller.phone_number}`);
                        console.log (`extension_number: ${data.payload.object.callee.extension_number}`);
                        
                        //
                        // Validating the extension number
                        //
                        if (ZOOM_EXTENSION_NUMBERS) {
                            const extensionNumbers = JSON.parse(ZOOM_EXTENSION_NUMBERS).extensions;
                            const phone_number = String(data.payload.object.callee.extension_number);
                            const isValidExtension = extensionNumbers.includes(phone_number);

                            if (isValidExtension) {
                                let clientMessage = { "extension": data.payload.object.callee.extension_number, "url": ZOOM_PHONE_POPUP_URL + `${data.payload.object.caller.phone_number}` };
                                console.log("Sending message to client: " + JSON.stringify(clientMessage));
                                broadcast(JSON.stringify(clientMessage));

                            } else {
                                console.log("Extension number does not match, ignoring call.");
                            }
                        } else {
                            console.log("ZOOM_EXTENSION_NUMBERS is not set, ignoring call.");
                        }              
                        res.status(200);
                    }            
                }
            }
        } else {
            response = { message: 'Unauthorized request to Zoom Webhook sample.', status: 401 }

            console.log(response.message)

            res.status(response.status)
            res.json(response)
        }
    }
    catch (error) {
        console.error("Error processing request:", error);
        res.sendStatus(500).send("Internal Server Error");
    }
    
});

//
// Send the request to the client
//
router.post('/SendClient', async function(req, res){

    
});

module.exports = router;