let elements = {
    par: { content: '{}', shift: 1 },

};

class EditorManager {
    constructor(){
        this.tabKey = 9;
        this.shorcuts = {
            '{': elements.par,

        };
    }

    enableTab(textBox, keyEvent) {
        if (this.isTabKeyInput(keyEvent)) {

            var pos = this.getCaretPosition(textBox);
            var preText = textBox.value.substring(0, pos);
            var postText = textBox.value.substring(pos, textBox.value.length);
            let elementInserted = false;

            for (let short in this.shorcuts) {
                if (preText.slice(preText.length - short.length, preText.length) == short) {
                    this.insert(textBox, short, this.shorcuts[short], preText, postText, pos);
                    elementInserted = true;
                    break;
                }
            }

            if (!elementInserted)
                this.insertTab(textBox, preText, postText, pos);
            this.blockKeyEvent(keyEvent);
        }
    }

    isTabKeyInput(keyEvent) {
        return keyEvent.keyCode == this.tabKey;
    }

    insert(textBox, shortcut, element, preText, postText, pos) {
        preText = preText.slice(0, preText.length - shortcut.length);
        textBox.value = preText + element.content + postText
        console.log(pos, element.shift, shortcut.length);
        this.setCaretPosition(textBox, pos + element.shift - shortcut.length);
    }

    insertTab(textBox, preText, postText, pos) {
        textBox.value = preText + '\t' + postText;
        this.setCaretPosition(textBox, pos + 1);
    }

    insertElement(element, textBox) {
        var pos = this.getCaretPosition(textBox);
        var preText = textBox.value.substring(0, pos);
        var postText = textBox.value.substring(pos, textBox.value.length);
        textBox.value = preText + element.content + postText
        this.setCaretPosition(textBox, pos + element.shift);
    }

    setCaretPosition(item, pos) {
        item.focus();
        item.setSelectionRange(pos, pos);
    }

    getCaretPosition(item) {
        var caretPosition = 0;
        if (item.selectionStart || item.selectionStart == '0') {
            caretPosition = item.selectionStart;
        }
        return caretPosition;
    }

    blockKeyEvent(keyEvent) {
        if (keyEvent.preventDefault) {
            keyEvent.preventDefault();
        } else {
            keyEvent.returnValue = false;
        }
    }
};