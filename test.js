const WebSocket = require('ws');
const net = require('net');

const wss = new WebSocket.Server({ port: 8085 });

wss.on('connection', (ws) => {
    // ws.on('message', function incoming(message) {
    //     console.log('received: %s', message);
    // });
    //
    // ws.send('hello from the server!');


    // Create a new TCP client for each WebSocket connection
    const tcpClient = net.createConnection({ port: 8080, host: 'localhost' }, () => {
        console.log('Connected to TCP server');
    });

    ws.on('message', (message) => {
        console.log('Received message from client:', message);
        tcpClient.write(message);
        // ws.send("test")
    });

    tcpClient.on('data', (data) => {
        console.log('Received data from TCP server:', data.toString());
        ws.send(data.toString());
    });

    // Handle TCP client error and close events
    tcpClient.on('error', (error) => {
        console.error('TCP client error:', error);
        ws.close();
    });

    tcpClient.on('close', () => {
        console.log('TCP client connection closed');
    });

    // Handle WebSocket close event
    ws.on('close', () => {
        console.log('WebSocket connection closed');
        tcpClient.end();
    });

    // Handle WebSocket error event
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        tcpClient.end();
    });
});

console.log('WebSocket server running on ws://localhost:8085');

//
// const WebSocket = require('ws');
// const net = require('net');
//
// const wss = new WebSocket.Server({ port: 8085 });
//
// wss.on('connection', (ws) => {
//     // Create a new TCP client for each WebSocket connection
//     const tcpClient = net.createConnection({ port: 8080, host: 'localhost' }, () => {
//         console.log('Connected to TCP server');
//     });
//
//     ws.on('message', (message) => {
//         console.log('Received message from client:', message);
//         tcpClient.write(message);
//         ws.send("test")
//     });
//
//     tcpClient.on('data', (data) => {
//         console.log('Received data from TCP server:', data.toString());
//         ws.send(data.toString());
//     });
//
//     // Handle TCP client error and close events
//     tcpClient.on('error', (error) => {
//         console.error('TCP client error:', error);
//         ws.close();
//     });
//
//     tcpClient.on('close', () => {
//         console.log('TCP client connection closed');
//     });
//
//     // Handle WebSocket close event
//     ws.on('close', () => {
//         console.log('WebSocket connection closed');
//         tcpClient.end();
//     });
//
//     // Handle WebSocket error event
//     ws.on('error', (error) => {
//         console.error('WebSocket error:', error);
//         tcpClient.end();
//     });
// });
//
// console.log('WebSocket server running on ws://localhost:8085');
