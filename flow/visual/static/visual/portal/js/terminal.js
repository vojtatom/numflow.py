'use strict';

class Terminal {
    constructor(){
        this.key = uuid();
        this.waiting = false;

        this.socket = this.socket();
        UITerminal.add_output('terminal initialized with uuid<br>' + this.key, 0);
    }

    command(text, data){
        if (this.waiting)
            return;
        this.send(text, data);
    }

    socket(){
        console.log('constructing terminal', this.key);
        let socket = new ReconnectingWebSocket(
            'ws://' + window.location.host +
            '/ws/terminal/' + this.key + '/');

        socket.onmessage = (e) => {
            let data = JSON.parse(e.data);
            console.log(data);

            if (data.type == 'command'){
                UITerminal.add_command(data.text);
            } else {
                UITerminal.add_output(data.text, data.status);
                this.waiting = false;
            }
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
        console.log('closing websocket...');
        this.socket.close(1000, 'Switching views, therfor closing.');
    }
}