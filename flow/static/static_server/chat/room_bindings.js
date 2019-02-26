window.onload = function(event) { 
    let chat = new Chat(roomName, user);
    let socket = chat.chatroom();

    document.getElementById('messages').onscroll = function(e) {
        if (e.target.scrollTop == 0)
            chat.loadMessages();       
    }
};