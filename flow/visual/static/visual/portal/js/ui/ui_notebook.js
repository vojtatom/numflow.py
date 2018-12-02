'use strict';

class UINotebook {
    static createRecord(notebook) {
        UIFileDelete.create(notebook, '/notebook/delete', UINotebook.createRecord);
        UIFileEdit.create(notebook, '/notebook/rename', UINotebook.createRecord);
        UINotebookOpen.create(notebook);
        UIFile.create(notebook);
    }

    static createForm() {
        let code = document.getElementById('code').value;
        let form = document.getElementById('notebook_form');
        UINotebookForm.onsubmit(form, code);

        let manager = new EditorManager();
        let editor = document.getElementById('notebook_form_data');

        editor.onkeydown = function(e) { 
            manager.enableTab(editor, e);
        };

        editor.focus();

    }
}