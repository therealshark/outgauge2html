'use strict';
// modules
var spawn = require('open'),
    express = require('express'),
    http = require('http'),
    path = require('path'),
    dgram = require('dgram'),
    socketIO = require('socket.io');
// server
var app = express(),
    httpServer = http.Server(app),
    io = socketIO(httpServer),
    udpServer = dgram.createSocket('udp4');
// config
var config = require('./config.json');


// configure static files
app.use(express.static(path.join(__dirname, 'public')));

// Start the http server
httpServer.listen(config.webPort, function(){
	console.log('HTTP Server listening on port ' + config.webPort);
    spawn('http://127.0.0.1:'+config.webPort);
});

udpServer.on('listening', function () {
	console.log('UDP Server listening on port ' + udpServer.address().port);
});

// converting the outgauge packages to JSON transmitted via Socket.IO
udpServer.on('message', function (message) {
	var buff = new Buffer(message);
	var outgaugeData = {
		time: buff.readInt32LE(0),
		car: buff.toString('ascii',4,7),
		flags: buff.readUInt16LE(8),
		plid: buff.readUInt8(9),
		gear: buff.readUInt8(10),
		speed: buff.readFloatLE(12),
		rpm: buff.readFloatLE(16),
		turbo: buff.readFloatLE(20),
		engtemp: buff.readFloatLE(24),
		fuel: buff.readFloatLE(28),
		oilpressure: buff.readFloatLE(32),
		oiltemp: buff.readFloatLE(36),
		dashlights: buff.readInt32LE(40),
		showlights: buff.readInt32LE(44),
		throttle: buff.readFloatLE(48),
		brake: buff.readFloatLE(52),
		clutch: buff.readFloatLE(56),
        // TODO: Those aren't completly right
		display: [
			buff.toString('ascii', 60, 75),
			buff.toString('ascii', 76, 92)
		]
	};
	io.emit('outgauge',outgaugeData);
});

// start the udp server
udpServer.bind(config.outgaugePort);