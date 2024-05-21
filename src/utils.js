

export function cipher(msg, key){
    if(msg === undefined){
        msg = "closed";
    }
    if(key === undefined){
        key = 0;
    }

    let result = "";
    for(let i = 0; i < msg.length; i++){
        let chara = String.fromCharCode(parseInt(msg.charCodeAt(i)) + key);
        result += chara;
    }

    return result;
}

export function sendToServer(formData) {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket('ws://localhost:8085');

        ws.addEventListener('open', function open() {
            ws.send(formData);
        });

        ws.addEventListener('message', function incoming(data) {
            // console.log(data);
            resolve(data); // Resolve the promise with the received data
            ws.close(); // Close the WebSocket connection
        });

        ws.addEventListener('error', function error(err) {
            reject(err); // Reject the promise if there's an error
        });
    });
    // return new Promise((resolve, reject) => {
    //     const socket = new WebSocket('ws://localhost:8085');
    //
    //     // Set a timeout to close the socket if it takes too long to connect
    //     const timeout = setTimeout(() => {
    //         if (socket.readyState !== WebSocket.CLOSED) {
    //             console.error('Connection timed out');
    //             socket.close();
    //             reject(new Error('Connection timed out'));
    //         }
    //     }, 5000); // 5 seconds timeout, adjust as needed
    //
    //     socket.addEventListener('open', () => {
    //         clearTimeout(timeout);
    //         console.log('Connection established');
    //         socket.send(JSON.stringify(formData));
    //     });
    //
    //     socket.addEventListener('message', (event) => {
    //         console.log('Received message from server:', event.data);
    //         resolve(event.data);
    //         // Don't close the socket here; close it when you're done using it
    //     });
    //
    //     socket.addEventListener('error', (error) => {
    //         console.error('WebSocket error:', error);
    //         reject(error);
    //     });
    //
    //     socket.addEventListener('close', () => {
    //         console.log('Connection closed');
    //     });
    // });
}
