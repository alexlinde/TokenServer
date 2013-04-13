var app = require('express')();
app.use(express.logger());
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var port = process.env.PORT || 5000;
app.listen(port, function() {
           console.log("Listening on " + port);
           });

// serve the homepage for iphone management
app.get('/', function (req, res) {
        res.sendfile(__dirname + '/index.html');
        });

// heroku does not support websockets so force polling
io.configure(function () {
             io.set("transports", ["xhr-polling"]);
             io.set("polling duration", 10);
             });

// handle the socket
io.sockets.on('connection', function (socket) {
              socket.emit('news', { hello: 'world' });
              socket.on('my other event', function (data) {
                        console.log(data);
                        });
              });

