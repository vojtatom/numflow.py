'use strict';

/**
 * Class representing the terminal in the notebook editor.
 */
class Terminal {
    /**
     * Construct a terminal and connect the terminal websocket to the 
     * server.
     * 
     * @param {UUID} code terminal uuid, used for socket construction
     */
    constructor(code){
        this.code = code;
        this.waiting = false;
        this.formats = ['output', 'error', 'progress', 'command', 'info'];

        this.socket = this.socket();
        UITerminal.addLine('terminal initialized with uuid<br>' + this.code, 'info');
    }

    /**
     * Try to send a command to the server along with additional data.
     * @param {string} text command
     * @param {string} data additional data
     */
    command(text, data){
        if (this.waiting)
            return;
        this.send(text, data);
    }

    /**
     * Create and set up a web socket.
     */
    socket(){
        console.log('constructing terminal', this.code);
        let url = window.location.host.split(':');
        let socket = new ReconnectingWebSocket(
            'ws://' + url[0] +
            ':9000/ws/terminal/' + this.code + '/');

        socket.onmessage = (e) => {
            let data = JSON.parse(e.data);

            if (this.formats.indexOf(data.type) > -1)
                UITerminal.addLine(data.text, data.type);
            
            if (data.type == 'output' || data.type == 'error'){
                this.waiting = false;
            };
        };

        socket.onerror = (e) => {
            UITerminal.addLine('websocket failed to connect!', 'error');
            //socket.close(1000, 'Closing after failed connection.');
        };

        return socket;
    }

    /**
     * Send a command to the server along with additional data.
     * @param {string} text command
     * @param {string} data additional data
     */
    send(text, data){
        this.waiting = true;
        this.socket.send(JSON.stringify({
            'command': text,
            'data': data,
        }));  
        
        UITerminal.clear();
    }

    /**
     * Close the connection with the server.
     */
    close(){
        if (this.socket !== null){
            console.log('closing websocket...');
            this.socket.close(1000, 'Switching views, therfore closing.');
        }
    }
}