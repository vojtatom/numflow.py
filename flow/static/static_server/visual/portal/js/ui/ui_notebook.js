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
        let form = document.getElementById('notebook_form');
        let editor = new Editor();
        
        DataManager.request({
            url: '/notebook/data',
            decode: true,
            data: { code: code },
            fail: (r) => console.error(r),
            success: (r, url) => {
                editor.deserialize(r.data);
            },
        });

        UINotebookForm.onsubmit(form, editor, code);
        return editor;
    }
}