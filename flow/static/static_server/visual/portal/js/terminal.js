'use strict';

class Terminal {
    constructor(code){
        this.code = code;
        this.waiting = false;

        this.socket = this.socket();
        UITerminal.addLine('terminal initialized with uuid<br>' + this.code, 'info');
    }

    command(text, data){
        if (this.waiting)
            return;
        this.send(text, data);
    }

    socket(){
        console.log('constructing terminal', this.code);
        let socket = new ReconnectingWebSocket(
            'ws://' + window.location.host +
            '/ws/terminal/' + this.code + '/');

        socket.onmessage = (e) => {
            let data = JSON.parse(e.data);
            UITerminal.addLine(data.text, data.type, data.status);
            
            if (data.type == 'output'){
                this.waiting = false;
            };
        };

        socket.onerror = (e) => {
            UITerminal.addLine('websocket failed to connect!', 'error');
            //socket.close(1000, 'Closing after failed connection.');
        };

        return socket;
    }

    send(text, data){
        this.waiting = true;
        this.socket.send(JSON.stringify({
            'command': text,
            'data': data,
        }));        
    }

    close(){
        if (this.socket !== null){
            console.log('closing websocket...');
            this.socket.close(1000, 'Switching views, therfore closing.');
        }
    }
}