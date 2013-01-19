"use strict";

var Stream = require('stream');
var jsonOverTCP = require('../index.js'),
	Protocol = jsonOverTCP.Protocol,
	createProtocol = jsonOverTCP.createProtocol,
	ProtocolError = jsonOverTCP.ProtocolError;

var EchoStream = function(){
	Stream.apply(this, arguments);
};
EchoStream.prototype = Object.create(Stream.prototype);

EchoStream.prototype.writable = true;
EchoStream.prototype.write = function(data){
	this.emit('data', data);
};

var testData = {hello: "world", 42: null};		

exports.protocol = {
	create: function(test){
		test.expect(3);

		var stream = new Stream();
		var validProtocol = new Protocol(stream);

		test.ok(validProtocol instanceof Protocol, 'Unable to construct with valid params');

		var validProtocol2 = createProtocol(stream);
		test.ok(validProtocol2 instanceof Protocol, 'Unable to construct with valid params');

		var error;
		try{
			var invalidProtocol = new Protocol();
		} catch(e){
			error = e;
		}

		test.ok(error instanceof TypeError, 'TypeError not thrown for invalid params');

		test.done();
	},
	readWriteObject: function(test){
		test.expect(1);

		var stream = new EchoStream();

		var protocol = new Protocol(stream);

		protocol.on('data', function(data){
			test.deepEqual(data, testData, "Serialization/deserialization failure");
			test.done();
		});

		protocol.write(testData);
	},
	readWriteString: function(test){
		test.expect(1);
		var testData = "hello, world!";		
		var stream = new EchoStream();

		var protocol = new Protocol(stream);

		protocol.on('data', function(data){
			test.deepEqual(data, testData, "Serialization/deserialization failure");
			test.done();
		});

		protocol.write(testData);
	},
	invalidWrite: function(test){
		test.expect(0);
		var testData = function(){ /* unserializable! */ };		
		var stream = new EchoStream();

		var protocol = new Protocol(stream);

		protocol.on('data', function(data){
			test.deepEqual(data, testData, "Serialization/deserialization failure");
		});

		protocol.write(testData);
		test.done();
	},
	invalidRead: function(test){
		test.expect(1);
		var testData = function(){ /* unserializable! */ };		
		var stream = new EchoStream();

		var protocol = new Protocol(stream);

		var error;
		try{
			stream.write(testData);	
		} catch(e){
			error = e;
		}

		test.ok(error instanceof TypeError, "Invalid stream data didn't throw type error.");
		
		test.done();
	},
	invalidStreamData: function(test){
		test.expect(1);
		var buffer = new Buffer(10);
		buffer.write("poop");
		var stream = new EchoStream();

		var protocol = new Protocol(stream);
		protocol.on('data', function(data){
			console.log(data);
		});
		var error;
		try{
			stream.write(buffer);	
		} catch(e){
			error = e;
		}

		test.ok(error instanceof ProtocolError, "Invalid stream data didn't throw type error.");
		
		test.done();	
	}
};