'use strict';

class Terminal {
    constructor(){
        this.key = uuid();
        this.waiting = false;

        this.socket = this.socket();
    }

    command(text){
        if (this.waiting)
            return;

        UITerminal.add_command(text)
        this.send(text);
    }

    socket(){
        console.log('constructing terminal', this.key);
        let socket = new ReconnectingWebSocket(
            'ws://' + window.location.host +
            '/ws/terminal/' + this.key + '/');

        socket.onmessage = (e) => {
            let data = JSON.parse(e.data);
            UITerminal.add_output(data.text);
            this.waiting = false;
        };

        return socket;
    }

    send(text){
        this.waiting = true;
        this.socket.send(JSON.stringify({
            'command': text
        }));        
    }

    close(){
        console.log('closing websocket...');
        this.socket.close(1000, 'Switching views, therfor closing.');
    }
}