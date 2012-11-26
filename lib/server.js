var net = require('net'),
	EventEmitter = require('events').EventEmitter,
	_ = require('underscore'),
	createSocket = require('./socket.js').create;

exports.create = function(options, listener){
	var server = new Server(options, listener);
	return server;
};

var Server = exports.Server = function(options, listener){
	var self = this;
	this._server = new net.Server(options, listener);
	this._emitter = new EventEmitter();
		
	Object.defineProperty(this, 'connections', {
		get: function() {
			return self._server.connections;
		},
		enumerable: true
	});

	_.bindAll(this, '_connectionHandler');

	this._server.on('connection', this._connectionHandler);
	this._server.on('listening', function(){
		self._emitter.emit('listening');
	});
	this._server.on('close', function(){
		self._emitter.emit('close');
	});
	this._server.on('error', function(e){
		self._emitter.emit('error', e);
	});
};

Server.prototype.listen = function(){
	return this._server.listen.apply(this._server, arguments);
};

Server.prototype.close = function(){
	return this._server.close.apply(this._server, arguments);
};

Server.prototype.address = function(){
	return this._server.address.apply(this._server, arguments);
};

Server.prototype.addListener = Server.prototype.on = function(){
	return this._emitter.on.apply(this._emitter, arguments);
};

Server.prototype.once = function(){
	return this._emitter.once.apply(this._emitter, arguments);
};

Server.prototype.removeListener = function(){
	return this._emitter.removeListener.apply(this._emitter, arguments);
};

Server.prototype._connectionHandler = function(socket){
	if (this.maxConnections && this._connections >= this.maxConnections) {
		socket.close();
		return;
	}

	var protocolSocket = createSocket(socket);
	this._emitter.emit('connection', protocolSocket);
};
