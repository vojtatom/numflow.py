'use strict';

/*window.onload = function(e){ 
    ChatDataManager.request({ query: 'ah' }, 
        (res) => { console.log(res); }, 
        (res) => { console.log(res); } );
}*/

document.getElementById('users').onkeyup = function (e) {
    let value = document.getElementById('users').value;
    new Chat().request(value)
};


document.getElementById('newchat').onsubmit = function (e) {
    console.log("submit");
    new Chat().fillForm();
}

/*document.getElementById('send').onclick = function (e) {
    new Chat().goToRoom()
};*/