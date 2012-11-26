# json-over-tcp [![Build Status](https://secure.travis-ci.org/ozanturgut/json-over-tcp.png?branch=master)](http://travis-ci.org/ozanturgut/json-over-tcp)

Node.js TCP server/client messaging in JSON.

This library provides a server and a socket class (with APIs that are very similar to the net package in Node.js) which communicate
by sending each other JSON messages.

You "write" JSON objects to the socket, and the "data" events on the other end of the socket emits the JSON object you wrote.

## A Short Illustration
``` javascript
// assume that I have a json-over-tcp server listening somewhere and I created a connection to it called "connection"
var someObject = {
  "this property is null": null,
  1928: 3734,
  turtle: {
    neck: "sweater"
  }
};

connection.write(someObject);
// Whatever is listening to this connection on the server-side will now recieve a "data" event with an object that
// has the same values as "someObject".
```


## A Real Example
``` javascript
// This script will output "Client's question: Hello, world?" and "Server's answer: 42" in alternating order
// every second until the script is stopped.

var someRandomPort = 8099,
  jsonOverTCP = require('json-over-tcp');

var server = jsonOverTCP.createServer(someRandomPort);
server.on('listening', createConnection);
server.on('connection', newConnectionHandler);

// Triggered whenever something connects to the server
function newConnectionHandler(socket){
  // Whenever a connection sends us an object...
  socket.on('data', function(data){
    // Output the question property of the client's message to the console
    console.log("Client's question: " + data.question);

    // Wait one second, then write an answer to the client's socket
    setTimeout(function(){
      socket.write({answer: 42});
    }, 1000);
  });
};

// Creates one connection to the server when the server starts listening
function createConnection(){
  // Start a connection to the server
  var socket = jsonOverTCP.connect(someRandomPort, function(){
    // Send the initial message once connected
    socket.write({question: "Hello, world?"});
  });
  
  // Whenever the server sends us an object...
  socket.on('data', function(data){
    // Output the answer property of the server's message to the console
    console.log("Server's answer: " + data.answer);
    
    // Wait one second, then write a question to the socket
    setTimeout(function(){
      // Notice that we "write" a JSON object to the socket
      socket.write({question: "Hello, world?"});
    }, 1000);
  });
}

// Start listening
server.listen(someRandomPort);
```

## API
### ```createServer([options], [connectionListener])```
Factory function for creating a json-over-tcp server -- same options as [```net.createServer([options], [connectionListener])```](http://nodejs.org/api/net.html#net_net_createserver_options_connectionlistener) in the Node.js net module documentation.
### ```connect(options, [connectionListener])```
Factory function for creating a json-over-tcp socket -- same options as [```net.connect(options, [connectionListener])```](http://nodejs.org/api/net.html#net_net_connect_options_connectionlistener) in the Node.js net module documentation.
### ```createConnection(options, [connectionListener])```
Factory function for creating a json-over-tcp socket -- same options as [```net.createConnection(options, [connectionListener])```](http://nodejs.org/api/net.html#net_net_connect_options_connectionlistener) in the Node.js net module documentation.
### ```connect(port, [host], [connectListener])```
Factory function for creating a json-over-tcp socket -- same options as [```net.connect(port, [host], [connectListener])```](http://nodejs.org/api/net.html#net_net_connect_port_host_connectlistener) in the Node.js net module documentation.
### ```createConnection(options, [connectionListener])```
Factory function for creating a json-over-tcp socket -- same options as [```net.createConnection(port, [host], [connectListener])```](http://nodejs.org/api/net.html#net_net_connect_port_host_connectlistener) in the Node.js net module documentation.
### ```connect(path, [connectListener])```
Factory function for creating a json-over-tcp socket -- same options as [```net.connect(path, [connectListener])```](http://nodejs.org/api/net.html#net_net_connect_path_connectlistener) in the Node.js net module documentation.
### ```createConnection(path, [connectListener])```
Factory function for creating a json-over-tcp socket -- same options as [```net.createConnection(path, [connectListener])```](http://nodejs.org/api/net.html#net_net_connect_path_connectlistener) in the Node.js net module documentation.
### ```createProtocol(stream)```
Factory function for creating a json-over-tcp protocol object.
### ```createSocket([options])```
Factory function for creating a json-over-tcp socket.

### ```Server```
>The server API is the same as the [```Server``` API in the native 'net' module](http://nodejs.org/api/net.html#net_class_net_server) with the following differences:
##### ```Event: 'connection'``` 
Emits a json-over-tcp socket (see it's API below) instead of a plain tcp socket.

### ```Socket```
>The socket API is the same as the [```Socket``` API in the native 'net' module](http://nodejs.org/api/net.html#net_class_net_socket) with the following differences:
##### ```Event: 'data'```
Emits a JSON object which was sent by the other end of the socket.
##### ```write(obj)```
Sends an object to the other end of the socket. This method doesn't accept any of the other parameters as the plain tcp socket.

### ```Protocol```
> The protocol object is what serializes/deserializes JSON data over the wire.
##### new Protocol(stream)
Takes in a [```Stream```](http://nodejs.org/api/stream.html) object and reads/writes JSON objects using it's a simple  protocol (a protocol signature, message length, and stringified JSON).
##### ```write(obj)``` 
Writes an object which can be stringified to the stream.
##### ```on``` 
Bind to an event (```'data'``` is the only one ever emitted).
##### ```removeListener``` 
Remove a bound listener.
##### ```Event: 'data'``` 
Emits a JSON object whenever a stream message is recieved.
