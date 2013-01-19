"use strict";

var net = require('net');
var jsonOverTCP = require('../index.js'),
	Server = jsonOverTCP.Server,
	Socket = jsonOverTCP.Socket,
	createSocket = jsonOverTCP.createSocket;

var TEST_PORT = 8099;		
var testData = {hello: "world", 42: null};		

exports.protocol = {
	create: function(test){
		test.expect(2);

		var socket = new Socket();
		test.ok(socket instanceof Socket, 'Unable to construct with valid params');

		var socket2 = createSocket();
		test.ok(socket2 instanceof Socket, 'Unable to construct with valid params');

		test.done();
	},
	connect: function(test){
		test.expect(1);

		var server = new Server(),
			socket;

		var timeout = setTimeout(function(){
			server.close();
			socket.destroy();
			test.ok(false, "Socket failed to connect to server");
			test.done();
		}, 1000);

		server.listen(TEST_PORT, function(){
			socket = new Socket();
			socket.connect(TEST_PORT, function(){
				clearTimeout(timeout);
				socket.destroy();
				server.close();
				test.ok(true);
				test.done();	
			});
		});
	},
	sendData: function(test){
		test.expect(1);

		var server = new Server(),
			socket;

		var timeout = setTimeout(function(){
			server.close();
			socket.destroy();
			test.ok(false, "Sending of data failed");
			test.done();
		}, 1000);

		server.on('connection', function(socket){
			socket.on('data', function(data){
				clearTimeout(timeout);
				socket.destroy();
				server.close();
				test.deepEqual(data, testData);
				test.done();
			});
		});

		server.listen(TEST_PORT, function(){
			socket = new Socket();
			socket.connect(TEST_PORT, function(){
				socket.write(testData);
			});
		});
	},
	recieveData: function(test){
		test.expect(1);

		var server = new Server(),
			socket;

		var timeout = setTimeout(function(){
			server.close();
			socket.destroy();
			test.ok(false, "Sending of data failed");
			test.done();
		}, 1000);

		server.on('connection', function(socket){
			socket.write(testData);
		});

		server.listen(TEST_PORT, function(){
			socket = new Socket();
			socket.on('data', function(data){
				clearTimeout(timeout);
				socket.destroy();
				server.close();
				test.deepEqual(data, testData);
				test.done();
			});

			socket.connect(TEST_PORT);
		});
	}
};