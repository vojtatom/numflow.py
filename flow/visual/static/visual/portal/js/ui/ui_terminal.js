'use strict';

class UITerminal {
    static create(editor) {
        let form = document.getElementById('commandline');
        let list = document.getElementById('terminal');
        let input = document.getElementById('command');

        UITerminal.add_command('initializing terminal ui...')

        let terminal = new Terminal();

        form.onsubmit = function (e) {
            e.preventDefault();
            terminal.command(input.value, editor.serialize());
            list.scrollTop = list.scrollHeight;
            return false;
        }

        UITerminal.prepare_close(terminal);
    }

    static add_command(text) {
        let list = document.getElementById('terminal');
        let command = UICommand.create_command(text);
        list.appendChild(command);
        list.scrollTop = list.scrollHeight;

        let input = document.getElementById('command');
        input.value = '';
    }

    static add_output(text, status) {
        let list = document.getElementById('terminal');
        let command = UICommand.create_output(text, status);
        list.appendChild(command);
        list.scrollTop = list.scrollHeight;
    }

    static add_savepoint(){
        let list = document.getElementById('terminal');
        let savepoint = UICommand.create_savepoint();
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