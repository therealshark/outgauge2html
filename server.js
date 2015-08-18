'use strict';
// TODO: Need to order and structure this a bit
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var config = require('./config.json');
var dgram = require('dgram');
var udpServer = dgram.createSocket('udp4');

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Start the http server
http.listen(config.webPort, function(){
	console.log('HTTP Server listening on port ' + config.webPort);
});

udpServer.on('listening', function () {
	console.log('UDP Server listening on port ' + udpServer.address().port);
});

udpServer.on('message', function (message) {
	var buff = new Buffer(message);
	var outgaugeData = {
		time: buff.readInt32LE(0),
		car: buff.toString('ascii',4,7),
		flags: buff.readUInt8(9),
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
			buff.toString('ascii', 60, 73),
			buff.toString('ascii', 76, 92)
		]
	};
	io.emit('outgauge',outgaugeData);
});

// start the udp server
udpServer.bind(config.outgaugePort);