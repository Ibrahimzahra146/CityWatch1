'use strict';
const db = require('node-localdb');
const user = db('user.json');
const apiai = require('apiai');
const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('node-uuid');
const request = require('request');
const JSONbig = require('json-bigint');
const async = require('async');
var pg = require('pg');

const REST_PORT = (process.env.PORT || 5000);
const APIAI_ACCESS_TOKEN = process.env.APIAI_ACCESS_TOKEN;
const APIAI_LANG = process.env.APIAI_LANG || 'en';
const FB_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;
const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;

const apiAiService = apiai(APIAI_ACCESS_TOKEN, { language: APIAI_LANG, requestSource: "fb" });
const sessionIds = new Map();
var image123 = "";
var issueType = "";
function processEvent(event) {
    var sender = event.sender.id.toString();
    try {
        image123 = event.message.attachments[0].payload.url;
        var text12 = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "button",
                    "text": "Specify the type of the issue",
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "Dangerous",
                            "payload": "Dangerous"
                        },
                        {
                            "type": "postback",
                            "title": "Wrong",
                            "payload": "Wrong"
                        },
                        {
                            "type": "postback",
                            "title": "Not Nice",
                            "payload": "not nice"
                        }
                    ]
                }
            }
        };

        var stringfy = JSON.stringify(text12);
        var obj1 = JSON.parse(stringfy);
        var splittedText1 = splitResponse("I am at the beginning");
        var flag = "false";
        async.eachSeries(splittedText1, (textPart, callback) => {
            sendFBMessage(sender, obj1, callback);


        });

    }
    catch (e) {

    }



    if ((event.message && event.message.text) || (event.postback && event.postback.payload)) {

        var text = event.message ? event.message.text : event.postback.payload;

        // Handle a text message from this sender

        if (!sessionIds.has(sender)) {
            sessionIds.set(sender, uuid.v1());
        }

        console.log("Text", text);

        let apiaiRequest = apiAiService.textRequest(text,
            {
                sessionId: sessionIds.get(sender)
            });

        apiaiRequest.on('response', (response) => {
            if (isDefined(response.result)) {
                let responseText = response.result.fulfillment.speech;
                let responseData = response.result.fulfillment.data;
                let action = response.result.action;
                if (responseText == "get") {
                    request({
                        url: "https://h8m587s0i7.execute-api.us-east-1.amazonaws.com/dev/usersposts?page=1",
                        json: true
                    }, function (error, response, body) {

                        if (!error && response.statusCode === 200) {

                            var text12 = {
                                "attachment": {
                                    "type": "template",
                                    "payload": {
                                        "template_type": "generic",

                                        "elements": [
                                            {
                                                "title": body.results[0]["userName"],
                                                "subtitle": "near you",
                                                "image_url": body.results[0]["imageUrl"],
                                                "buttons": [
                                                    {
                                                        "type": "element_share"
                                                    },
                                                    {

                                                        "type": "postback",
                                                        "title": "+1",
                                                        "payload": "like"

                                                    }
                                                ]
                                            },
                                            {
                                                "title": body.results[1]["userName"],
                                                "subtitle": "The local area is due for record thunderstorms over the weekend.",
                                                "image_url": body.results[1]["imageUrl"],
                                                "buttons": [
                                                    {
                                                        "type": "element_share"
                                                    },
                                                    {

                                                        "type": "postback",
                                                        "title": "+1",
                                                        "payload": "like"

                                                    }
                                                ]
                                            },
                                            {
                                                "title": body.results[2]["userName"],
                                                "subtitle": "The local area is due for record thunderstorms over the weekend.",
                                                "image_url": body.results[2]["imageUrl"],
                                                "buttons": [
                                                    {
                                                        "type": "element_share"
                                                    },
                                                    {

                                                        "type": "postback",
                                                        "title": "+1",
                                                        "payload": "like"

                                                    }
                                                ]
                                            },
                                            {
                                                "title": body.results[3]["userName"],
                                                "subtitle": "near you",
                                                "image_url": body.results[3]["imageUrl"],
                                                "buttons": [
                                                    {
                                                        "type": "element_share"
                                                    },
                                                    {

                                                        "type": "postback",
                                                        "title": "+1",
                                                        "payload": "like"

                                                    }
                                                ]
                                            },
                                            {
                                                "title": body.results[4]["userName"],
                                                "subtitle": "near you",
                                                "image_url": body.results[4]["imageUrl"],
                                                "buttons": [
                                                    {
                                                        "type": "element_share"
                                                    },
                                                    {

                                                        "type": "postback",
                                                        "title": "+1",
                                                        "payload": "like"

                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            };
                            var stringfy = JSON.stringify(text12);
                            var obj1 = JSON.parse(stringfy);
                            var splittedText1 = splitResponse("I am at the beginning");

                            async.eachSeries(splittedText1, (textPart, callback) => {
                                sendFBMessage(sender, obj1, callback);


                            });
                        }
                    });
                }
                else if (responseText == "openCamera") {


                    var splittedText = splitResponse(responseText);

                    async.eachSeries(splittedText, (textPart, callback) => {
                        sendFBMessage(sender, { text: " Open camera or upload an image " }, callback);
                    });


                }
                else if (responseText == "postIssue") {
                    if (image123 == "") {
                        var splittedText = splitResponse(responseText);
                        async.eachSeries(splittedText, (textPart, callback) => {
                            sendFBMessage(sender, { text: "you didn't upload image ,please upload an image " }, callback);
                        });
                    }
                    else {
                        var imageBase_64 = "";
                        var myJSONObject = "";
                        var request1 = require('request').defaults({ encoding: null });
                        request1.get(image123, function (err, res, body) {
                            imageBase_64 = Buffer(body).toString('base64');

                            myJSONObject = {
                                userName: "ibrahim zahra",
                                image: imageBase_64,
                                tag: issueType,
                                latitude: 50,
                                longitude: 60,
                                tagRange: 2,
                                description: "flase"
                            }
                            var stringfy = JSON.stringify(myJSONObject);
                            var obj11 = JSON.parse(stringfy);

                            request({
                                url: "https://h8m587s0i7.execute-api.us-east-1.amazonaws.com/dev/usersposts",
                                method: "POST",
                                json: true,   // <--Very important!!!
                                body: obj11
                            }, function (error, response, body) {

                                var splittedText12 = splitResponse("I am at the beginning");

                                async.eachSeries(splittedText12, (textPart, callback) => {
                                    sendFBMessage(sender, { text: "This issue is posted successfully!!" }, callback);


                                });
                            });
                        });
                        image123 = "";
                        issueType = "";
                    }
                }
                else if (responseText == "howBad") {
                    issueType = text;
                    var text12 = {
                        "attachment": {
                            "type": "template",
                            "payload": {
                                "template_type": "button",
                                "text": "How bad",
                                "buttons": [
                                    {
                                        "type": "postback",
                                        "title": "Low",
                                        "payload": "Low"
                                    },
                                    {
                                        "type": "postback",
                                        "title": "Intermidiate",
                                        "payload": "intermediate"
                                    },
                                    {
                                        "type": "postback",
                                        "title": "Extreme",
                                        "payload": "Extreme"
                                    }
                                ]
                            }
                        }
                    };
                    var stringfy = JSON.stringify(text12);
                    var obj1 = JSON.parse(stringfy);
                    var splittedText1 = splitResponse("I am at the beginning");

                    async.eachSeries(splittedText1, (textPart, callback) => {
                        sendFBMessage(sender, obj1, callback);


                    });



                }



                else if (responseText == "getStarted") {
                    var text12 = {
                        "attachment": {
                            "type": "template",
                            "payload": {
                                "template_type": "button",
                                "text": "pick one choice",
                                "buttons": [
                                    {
                                        "type": "postback",
                                        "title": "Show nearby issues",
                                        "payload": "show near by issues"
                                    },
                                    {
                                        "type": "postback",
                                        "title": "Show most voted nearby issue",
                                        "payload": "show most voted near by issues"
                                    },
                                    {
                                        "type": "postback",
                                        "title": "Report new issue",
                                        "payload": "report new issue"
                                    }
                                ]
                            }
                        }
                    };
                    var stringfy = JSON.stringify(text12);
                    var obj1 = JSON.parse(stringfy);
                    var splittedText1 = splitResponse("I am at the beginning");

                    async.eachSeries(splittedText1, (textPart, callback) => {
                        sendFBMessage(sender, obj1, callback);


                    });
                }

                else if (isDefined(responseData) && isDefined(responseData.facebook)) {
                    if (!Array.isArray(responseData.facebook)) {
                        try {
                            console.log('Response as formatted message');
                            sendFBMessage(sender, responseData.facebook);
                        } catch (err) {
                            sendFBMessage(sender, { text: err.message });
                        }
                    } else {
                        async.eachSeries(responseData.facebook, (facebookMessage, callback) => {
                            try {
                                if (facebookMessage.sender_action) {
                                    console.log('Response as sender action');
                                    sendFBSenderAction(sender, facebookMessage.sender_action, callback);
                                }
                                else {
                                    console.log('Response as formatted message');
                                    sendFBMessage(sender, facebookMessage, callback);
                                }
                            } catch (err) {
                                sendFBMessage(sender, { text: err.message }, callback);
                            }
                        });
                    }
                } else if (isDefined(responseText)) {
                    console.log('Response as text message');
                    // facebook API limit for text length is 320,
                    // so we must split message if needed
                    var splittedText = splitResponse(responseText);

                    async.eachSeries(splittedText, (textPart, callback) => {
                        sendFBMessage(sender, { text: textPart }, callback);
                    });
                }

            }
        });

        apiaiRequest.on('error', (error) => console.error(error));
        apiaiRequest.end();
    }
}

function splitResponse(str) {
    if (str.length <= 320) {
        return [str];
    }

    return chunkString(str, 300);
}

function chunkString(s, len) {
    var curr = len, prev = 0;

    var output = [];

    while (s[curr]) {
        if (s[curr++] == ' ') {
            output.push(s.substring(prev, curr));
            prev = curr;
            curr += len;
        }
        else {
            var currReverse = curr;
            do {
                if (s.substring(currReverse - 1, currReverse) == ' ') {
                    output.push(s.substring(prev, currReverse));
                    prev = currReverse;
                    curr = currReverse + len;
                    break;
                }
                currReverse--;
            } while (currReverse > prev)
        }
    }
    output.push(s.substr(prev));
    return output;
}

function sendFBMessage(sender, messageData, callback) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: FB_PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: {
            recipient: { id: sender },
            message: messageData
        }
    }, (error, response, body) => {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }

        if (callback) {
            callback();
        }
    });
}

function sendFBSenderAction(sender, action, callback) {
    setTimeout(() => {
        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: { access_token: FB_PAGE_ACCESS_TOKEN },
            method: 'POST',
            json: {
                recipient: { id: sender },
                sender_action: action
            }
        }, (error, response, body) => {
            if (error) {
                console.log('Error sending action: ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            }
            if (callback) {
                callback();
            }
        });
    }, 1000);
}

function doSubscribeRequest() {
    request({
        method: 'POST',
        uri: "https://graph.facebook.com/v2.6/me/subscribed_apps?access_token=" + FB_PAGE_ACCESS_TOKEN
    },
        (error, response, body) => {
            if (error) {
                console.error('Error while subscription: ', error);
            } else {
                console.log('Subscription result: ', response.body);
            }
        });
}

function isDefined(obj) {
    if (typeof obj == 'undefined') {
        return false;
    }

    if (!obj) {
        return false;
    }

    return obj != null;
}

const app = express();

app.use(bodyParser.text({ type: 'application/json' }));

app.get('/webhook/', (req, res) => {
    if (req.query['hub.verify_token'] == FB_VERIFY_TOKEN) {
        res.send(req.query['hub.challenge']);

        setTimeout(() => {
            doSubscribeRequest();
        }, 3000);
    } else {
        res.send('Error, wrong validation token');
    }
});

app.post('/webhook/', (req, res) => {
    try {
        var data = JSONbig.parse(req.body);

        if (data.entry) {
            let entries = data.entry;
            entries.forEach((entry) => {
                let messaging_events = entry.messaging;
                if (messaging_events) {
                    messaging_events.forEach((event) => {
                        if (event.message && !event.message.is_echo ||
                            event.postback && event.postback.payload) {
                            processEvent(event);
                        }
                    });
                }
            });
        }

        return res.status(200).json({
            status: "ok"
        });
    } catch (err) {
        return res.status(400).json({
            status: "error",
            error: err
        });
    }

});

app.listen(REST_PORT, () => {
    console.log('Rest service ready on port ' + REST_PORT);
});

doSubscribeRequest();
