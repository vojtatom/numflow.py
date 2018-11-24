'use strict';

class UITerminal {
    static create() {
        let form = document.getElementById('commandline');
        let list = document.getElementById('terminal');
        let input = document.getElementById('command');

        let terminal = new Terminal();

        form.onsubmit = function (e) {
            e.preventDefault();
            terminal.command(input.value);
            list.scrollTop = list.scrollHeight;
            return false;
        }

        UITerminal.prepare_close(terminal);
    }

    static add_command(text) {
        let list = document.getElementById('terminal');

        let command = UICommand.create_command(text);
        list.appendChild(command);

        let input = document.getElementById('command');
        input.value = '';
        list.scrollTop = list.scrollHeight;
    }

    static add_output(text) {
        let list = document.getElementById('terminal');

        let command = UICommand.create_output(text);
        list.appendChild(command);
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