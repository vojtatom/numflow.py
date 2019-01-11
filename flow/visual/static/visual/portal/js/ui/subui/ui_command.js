'use strict';

class UICommand {
    static createCommand(text){
        let li = document.createElement('li');
        li.classList.add('command');
        li.innerHTML = text;
        return li;
    }

    static createProgress(text){
        let li = document.createElement('li');
        li.classList.add('output');
        li.classList.add('progress')
        li.innerHTML = text;
        return li;   
    }

    static createInfo(text){
        let li = document.createElement('li');
        li.classList.add('info');
        li.innerHTML = text;
        return li;   
    }

    static createOutput(text, status){
        let li = document.createElement('li');
        li.classList.add('output');
        if (status != 0)
            li.classList.add('error')

        li.innerHTML = text;
        return li;   
    }

    static createSavepoint(){
        let li = document.createElement('li');
        li.classList.add('savepoint');
        li.innerHTML = 'Notebook saved at ' + new Date().toLocaleTimeString();
        return li;  
    }
}