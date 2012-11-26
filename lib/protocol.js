var net = require('net'),
	_ = require('underscore'),
	precondition = require('precondition'),
	EventEmitter = require('events').EventEmitter;

exports.create = function(stream){
	var protocol = new Protocol(stream);
	return protocol;
};

var ProtocolError = exports.ProtocolError = function(){
	Error.apply(this, arguments);
};
ProtocolError.prototype = Object.create(Error.prototype);

var Protocol = exports.Protocol = function(stream){
	precondition.checkDefined(stream, "A stream is required");
	var self = this;

	stream.on('data', function(data){
		self._read(data, 0);
	});

	this._emitter = new EventEmitter();
	
	this._stream = stream;

	this._buffer = void 0;
	this._bufferOffset = 0;
	this._bufferLength = 0;
};

Protocol.prototype._SIGNATURE = 206; // < must be 255

Protocol.prototype.write = function(obj){
	var message = JSON.stringify(obj),
		messageLength,
		buffer;

	if(message === void 0) return;

	messageLength = message.length;
	buffer = new Buffer(messageLength + 5);

	buffer.writeUInt8(this._SIGNATURE, 0);
	buffer.writeUInt32LE(messageLength, 1);
	buffer.write(message, 5);

	this._stream.write(buffer);
};

Protocol.prototype._read = function(packet, packetOffset){
	var packetLength = packet.length,
		bufferRemainderLength,
		packetRemainderLength;
	
	precondition.checkType(packet instanceof Buffer, 'Packet must be a Buffer instance.');

	if(this._bufferLength === 0){
		if(packet.readUInt8(0) !== this._SIGNATURE){
			throw new ProtocolError('Invalid message start signature');
		}
		
		this._bufferLength = packet.readUInt32LE(1);
		this._buffer = new Buffer(this._bufferLength);
		this._bufferOffset = 0;
		packetOffset = packetOffset + 5;
	}

	bufferRemainderLength = this._bufferLength - this._bufferOffset;
	packetRemainderLength = packetLength - packetOffset;
	if(bufferRemainderLength > packetRemainderLength){
		packet.copy(this._buffer, this._bufferOffset, packetOffset, packetLength);
		this._bufferOffset += packetRemainderLength;
	} else if (bufferRemainderLength === packetRemainderLength) {
		packet.copy(this._buffer, this._bufferOffset, packetOffset, packetLength);
		this._parseBuffer();
	} else { // bufferRemainderLength < packetRemainderLength
		packet.copy(this._buffer, this._bufferOffset, packetOffset, packetOffset + bufferRemainderLength);
		this._parseBuffer();
		// Read the rest of the packet
		this._read(packet, packetOffset + bufferRemainderLength);
	}
};

Protocol.prototype._parseBuffer = function(){
	var jsonString = this._buffer.toString('utf-8'),
		data = JSON.parse(jsonString);

	this._emitter.emit('data', data);
	this._bufferLength = 0; // reset buffer
};

Protocol.prototype.on = function(event, callback){
	this._emitter.on(event, callback);
};

Protocol.prototype.removeListener = function(event, callback){
	this._emitter.removeListener(event, callback);
};
