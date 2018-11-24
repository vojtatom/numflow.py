'use strict';

class UICommand {
    static create_command(text){
        let li = document.createElement('li');
        li.classList.add('command');
        li.innerHTML = text;
        return li;
    }

    static create_output(text){
        let li = document.createElement('li');
        li.classList.add('output');
        li.innerHTML = text;
        return li;   
    }
}