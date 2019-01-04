'use strict';

class UINotebook {
    static createRecord(notebook) {
        UIFileDelete.create(notebook, '/notebook/delete', UINotebook.createRecord);
        UIFileEdit.create(notebook, '/notebook/rename', UINotebook.createRecord);
        UINotebookOpen.create(notebook);
        UIFile.create(notebook);
    }

    static createEditor() {
        let code = document.getElementById('code').value;
        let editor = new Editor();
    }
}