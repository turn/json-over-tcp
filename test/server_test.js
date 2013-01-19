"use strict";

var net = require('net');
var jsonOverTCP = require('../index.js'),
	Server = jsonOverTCP.Server,
	Socket = jsonOverTCP.Socket,
	createServer = jsonOverTCP.createServer;

var TEST_PORT = 8099;

exports.protocol = {
	create: function(test){
		test.expect(2);

		var server = new Server();
		test.ok(server instanceof Server, 'Unable to construct with valid params');

		var server2 = createServer();
		test.ok(server2 instanceof Server, 'Unable to construct with valid params');

		test.done();
	},
	listen: function(test){
		test.expect(1);

		var server = new Server();
		var timeout = setTimeout(function(){
			server.close();
			
			test.ok(false, "Server failed to start listening");
			test.done();
		},1000);

		server.on('listening', function(){
			clearTimeout(timeout);
			server.close();
			
			test.ok(true);
			test.done();
		});
		server.listen(TEST_PORT);
	},
	connection: function(test){
		test.expect(1);

		var server = new Server();
		var connection;

		var timeout = setTimeout(function(){
			server.close();
			connection.destroy();
			test.ok(false, "Server failed to emit connected socket");
			test.done();
		}, 1000);

		server.on('connection', function(socket){
			clearTimeout(timeout);
			server.close();
			connection.destroy();
			
			test.ok(socket instanceof Socket, "Emitted connections must be instances of the protocol socket.");
			test.done();
		});

		server.listen(TEST_PORT, function(){
			connection = net.connect(TEST_PORT);
		});
	}
};