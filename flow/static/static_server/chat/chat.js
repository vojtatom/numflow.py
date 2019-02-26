'use strict';

var formatMessage = function(message) {
    let li = document.createElement('li');          
    let ul = document.createElement('ul');

    let li_sender = document.createElement('li');
    li_sender.innerHTML = message.sender;
    li_sender.classList.add('sender');

    let li_message = document.createElement('li');
    li_message.innerHTML = message.text;
    li_message.classList.add('text');

    let li_time = document.createElement('li');
    li_time.innerHTML = message.time;
    li_time.classList.add('time');

    ul.append(li_sender, li_message, li_time);
    li.append(ul);

    if (user == message.sender){
        li.classList.add('sent');
    } else {
        li.classList.add('recieved');
    }

    return li;
}

class Chat {
    constructor(key, user) {
        if (!Chat.instance) {
            Chat.instance = this;
            this.dm = new ChatDataManager();
            this.key = key;
            this.user = user;
            this.page = 0;
        }

        return Chat.instance;
    }

    request(value) {
        let data = { query: value };
        this.dm.requestFrequent(data, '/chat/users/', this.showUsers, this.showError);
    }

    showUsers(data) {
        console.log(data);
        let ul = document.getElementById('listed');
        ul.innerHTML = '';
        for (let user of data.users) {
            let li = document.createElement('li');
            li.innerHTML = user.name;
            ul.append(li);

            li.onclick = function (e) {
                let ul = document.getElementById('selected');
                let t = document.getElementById(e.target.innerHTML + '_selected');
                if (t === null) {
                    let li = document.createElement('li');
                    li.innerHTML = e.target.innerHTML;
                    li.id = user.name + '_selected';
                    li.onclick = function (e) {
                        e.target.parentNode.removeChild(e.target);
                    }
                    ul.append(li);
                };
            };
        }
    }

    showError(data) {
        console.log(data);
    }

    fillForm() {
        let ul = document.getElementById('selected');
        let users = [];
        for (let e of ul.children) {
            users.push(e.innerHTML);
        }
        document.getElementById('users').value =  users.join(', '); 
    }

    chatroom(){
        this.loadMessages();

        var chatSocket = new WebSocket(
            'ws://' + window.location.host +
            '/ws/chat/' + this.key + '/');
    
        chatSocket.onmessage = function(e) {
            let data = JSON.parse(e.data);
            let ol = document.getElementById('messages');
            let li = formatMessage(data);
            ol.append(li);
            li.scrollIntoView({behavior: 'smooth'});
        };
    
        chatSocket.onclose = function(e) {
            console.error('Chat socket closed unexpectedly');
        };
    
        document.getElementById('text').focus();
        document.getElementById('text').onkeyup = function(e) {
            if (e.keyCode === 13) {  // enter, return
                document.getElementById('submit').click();
            }
        };
    
        document.getElementById('submit').onclick = function(e) {
            let input = document.getElementById('text');
            let message = input.value.trim();

            if (message.length > 0){
                chatSocket.send(JSON.stringify({
                    'message': message
                }));
                input.value = '';
            }
        };
        
        return chatSocket;
    }

    loadMessages(){
        this.dm.request({ chatroom: this.key, page: this.page },
            '/chat/messages/',
            (res) => { 
                let ol = document.getElementById('messages');
                let target = ol.firstChild;
                for (let m of res.messages){
                    let li = formatMessage(m);
                    ol.prepend(li);
                }

                if (target === undefined || target === null){
                    ol.scrollTop = ol.scrollHeight;
                } else {
                    target.scrollIntoView();
                }
            }, 

            (res) => { console.log(res); } );

        this.page++;
    }

}