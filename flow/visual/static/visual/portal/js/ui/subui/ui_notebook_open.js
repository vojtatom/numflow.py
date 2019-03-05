'use strict';

class UINotebookOpen {
    static create(notebook) {
        let open_element = notebook.getElementsByClassName('open')[0];

        let open_call = function (e) {
            let code = notebook.id;

            DataManager.request({
                method: 'GET',
                url: '/notebook/' + code,
                success: (r) => {                   
                    UI.notebook(r);
                },
                fail: (r) => { console.error(r); }
            })
        }
        // disabled doubleclick
        //notebook.ondblclick = open_call;
        open_element.onclick = open_call;
    }
}