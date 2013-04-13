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

app.get('/zepto.js', function (req, res) {
        res.sendfile(__dirname + '/zepto.js');
        });

// heroku does not support websockets so force polling
io.configure(function () {
             io.set("transports", ["xhr-polling"]);
             io.set("polling duration", 10);
             });

// handle the socket
io.sockets.on('connection', function (socket) {
    var timer = setInterval(function () {
                    socket.volatile.emit('time', time);
                    }, 1000);

    socket.on('disconnect', function () {
            clearInterval(timer);
            });

    socket.on('add', function (data) {
            var secs = parseInt(data) * 60;
            time += secs;
            console.log("added " + secs + " seconds");
            });
  });

