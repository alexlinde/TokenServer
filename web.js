var express = require('express');
var app = express();
app.use(express.logger());
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
io.set('log level', 1);

var time = 0;

var port = process.env.PORT || 5000;
server.listen(port, function() {
           console.log("Listening on " + port);
           });

// serve the homepage for iphone management
app.get('/', function (req, res) {
        res.sendfile(__dirname + '/index.html');
        });

app.get('/test', function (req, res) {
        res.sendfile(__dirname + '/test.html');
        });

// heroku does not support websockets so force polling
// tried reducing to 2 secs to lower latency, but problem is that client has no time to respond
// likely the desktop uses two sockets which is really not an option for arduino, so let's err on
// the side of polling and send updates less frequently
io.configure(function () {
             io.set("transports", ["xhr-polling"]);
             io.set("polling duration", 10);
             });

var arduino;
var connected = false;
var client = io
        .of('/client')
        .on('connection', function (socket) {
//            socket.volatile.emit('update', {time: time, connected: connected});
//                    var timer = setInterval(function () {
//                                            socket.volatile.emit('update', {time: time, connected: connected});
//                                            }, 1000);
            
//                    socket.on('disconnect', function () {
//                              clearInterval(timer);
//                              });
            
                    socket.on('add', function (data) {
                              var secs = parseInt(data) * 60;
                              arduino.emit('add',secs);
                              console.log("added " + secs + " seconds");
                              });
                    });


// handle the socket
arduino = io
    .of('/arduino')
    .on('connection', function (socket) {
        connected = true;
    socket.on('update', function (data) {
           connected = true;
           time = parseInt(data);
           client.volatile.emit('update', {time: time, connected: connected});
           console.log("current arduino time " + time);
           });
    socket.on('disconnect', function () {
           connected = false;
              });
    });


