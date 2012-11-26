var someRandomPort = 8099,
  jsonOverTCP = require('../');

var server = jsonOverTCP.createServer(someRandomPort);
server.on('listening', createConnection);
server.on('connection', newConnectionHandler);

// Triggered when something connects to the server
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

// Creates one connection when the server starts listening
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