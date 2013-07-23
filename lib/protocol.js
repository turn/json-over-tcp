"use strict";

var net = require('net'),
	its = require('its'),
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
	its.object(stream, "A stream is required");
	
	var self = this;

	stream.on('data', function(data){
		self._read(data, 0);
	});

	this._emitter = new EventEmitter();
	this._tempBuff = new Buffer(4);
	this._tempBuffLen = 0;
	this._stream = stream;

	this._buffer = void 0;
	this._bufferOffset = 0;
	this._bufferLength = 0;
};

Protocol.prototype.write = function(obj){
	var message = JSON.stringify(obj),
		messageLength,
		buffer;

	if(message === void 0) return;

	messageLength = Buffer.byteLength(message, 'utf8');
	buffer = new Buffer(messageLength + 4);

	buffer.writeUInt32LE(messageLength, 0);
	buffer.write(message, 4);

	this._stream.write(buffer);
};

Protocol.prototype._read = function(packet){
	var packetLength = packet.length,
		packetOffset = 0,
		bufferRemainderLength,
		packetRemainderLength;
	
	its.type(packet instanceof Buffer, 'Packet must be a Buffer instance.');

	for(;;){ // Forever until break
		if(this._bufferLength === 0){ // If we're waiting to parse a new message
			if(packetOffset + 4 > packetLength){ // If we're at a packet boundary
				packet.copy(this._tempBuff, 0, packetOffset, packetLength);
				this._tempBuffLen = packetLength - packetOffset;
				break;
			} else if(this._tempBuffLen > 0){ // If we were just at a packet boundary
				packet.copy(this._tempBuff, this._tempBuffLen, 0, 4 - this._tempBuffLen);
				packetOffset += 4 - (this._tempBuffLen);

				this._bufferLength = this._tempBuff.readUInt32LE(0);
				this._tempBuffLen = 0;
			} else {
				this._bufferLength = packet.readUInt32LE(packetOffset);
				packetOffset += 4;
			}
			

			this._buffer = new Buffer(this._bufferLength);
			this._bufferOffset = 0;
			
			if(packetOffset === packetLength) break;
		}

		bufferRemainderLength = this._bufferLength - this._bufferOffset;
		packetRemainderLength = packetLength - packetOffset;

		if(bufferRemainderLength > packetRemainderLength){
			packet.copy(this._buffer, this._bufferOffset, packetOffset, packetLength);
			this._bufferOffset += packetRemainderLength;
			break; // packet consumed
		} else if (bufferRemainderLength === packetRemainderLength) {
			packet.copy(this._buffer, this._bufferOffset, packetOffset, packetLength);
			this._parseBuffer();
			break; // packet consumed
		} else { // bufferRemainderLength < packetRemainderLength
			packet.copy(this._buffer, this._bufferOffset, packetOffset, packetOffset + bufferRemainderLength);
			this._parseBuffer();
			packetOffset += bufferRemainderLength;
		}
	}
};

Protocol.prototype._cancel = function(){
	this._bufferLength = 0; // reset buffer
	this._buffer = void 0;
};

Protocol.prototype._parseBuffer = function(){
	try {
		var jsonString = this._buffer.toString('utf-8'),
			data = JSON.parse(jsonString);
		this._emitter.emit('data', data);

	} catch (e) {
		this._emitter.emit('error', e);
	}

	this._bufferLength = 0; // reset buffer
};

Protocol.prototype.on = function(event, callback){
	this._emitter.on(event, callback);
};

Protocol.prototype.removeListener = function(event, callback){
	this._emitter.removeListener(event, callback);
};
