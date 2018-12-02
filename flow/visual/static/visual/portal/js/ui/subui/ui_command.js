'use strict';

class UICommand {
    static create_command(text){
        let li = document.createElement('li');
        li.classList.add('command');
        li.innerHTML = text;
        return li;
    }

    static create_output(text, status){
        let li = document.createElement('li');
        li.classList.add('output');
        if (status != 0)
            li.classList.add('error')

        li.innerHTML = text;
        return li;   
    }

    static create_savepoint(){
        let li = document.createElement('li');
        li.classList.add('savepoint');
        li.innerHTML = 'Notebook saved at ' + new Date().toLocaleTimeString();
        return li;  
    }
}