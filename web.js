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
io.configure(function () {
             io.set("transports", ["xhr-polling"]);
             io.set("polling duration", 10);
             });

// handle the socket
var connected = false;
var arduino = io
    .of('/arduino')
    .on('connection', function (socket) {
        connected = true;
    socket.on('update', function (data) {
           connected = true;
           time = parseInt(data);
           console.log("current arduino time " + time);
           });
    socket.on('disconnect', function () {
           connected = false;
              });
    });


io.of('/client').on('connection', function (socket) {
    var timer = setInterval(function () {
        socket.volatile.emit('update', {time: time, connected: connected});
                    }, 1000);

    socket.on('disconnect', function () {
            clearInterval(timer);
            });

    socket.on('add', function (data) {
            var secs = parseInt(data) * 60;
            arduino.emit('add',secs);
            console.log("added " + secs + " seconds");
            });
  });

