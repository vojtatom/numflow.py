'use strict';

class UITerminal {
    static create(editor) {
        let form = document.getElementById('commandline');
        let list = document.getElementById('terminal');
        let input = document.getElementById('command');
        let code = document.getElementById('code').value;

        UITerminal.addLine('initializing terminal ui...', 'info')

        let terminal = new Terminal(code);

        form.onsubmit = function (e) {
            e.preventDefault();
            terminal.command(input.value, editor.serialize());
            list.scrollTop = list.scrollHeight;
            return false;
        }

        UITerminal.prepare_close(terminal);
    }

    static addLine(text, type, status) {
        let list = document.getElementById('terminal');
        let line;

        if (type == 'info'){
            line = UICommand.createInfo(text);
        } else if (type == 'command') {
            line = UICommand.createCommand(text);
        } else if (type == 'progress') {
            line = UICommand.createProgress(text);
        } else if (type == 'output') {
            line = UICommand.createOutput(text, status);
        }
        list.appendChild(line);
        list.scrollTop = list.scrollHeight;

        if (type == 'output'){
            let input = document.getElementById('command');
            input.value = '';
        }
    }

    static addSavepoint(){
        let list = document.getElementById('terminal');
        let savepoint = UICommand.createSavepoint();
        list.appendChild(savepoint);
        list.scrollTop = list.scrollHeight;
    }

    static prepare_close(terminal) {
        window.onbeforeunload = function () {
            UITerminal.close(terminal);
        };

        let observer = new MutationObserver(function (mutations, observer) {
            if (mutations[0].removedNodes) {
                terminal.close();
                observer.disconnect();
            }
        });

        observer.observe(document.getElementById('main'), { childList: true });

    }

    static close(terminal) {
        terminal.close()
    }
}