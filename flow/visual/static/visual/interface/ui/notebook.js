'use strict';

class UINotebook {
    static create(notebook) {
        UIFileDelete.create(notebook, '/notebook/delete', UINotebook.create);
        UIFileEdit.create(notebook, '/notebook/rename', UINotebook.create);
        UINotebookOpen.create(notebook);
        UIFile.create(notebook);
    }
}