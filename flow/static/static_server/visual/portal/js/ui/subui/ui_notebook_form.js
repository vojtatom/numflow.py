'use strict';

class UINotebookForm {
    static onsubmit(form, editor, code) {

        form.onsubmit = function(e) {
            e.preventDefault();
            console.log('uploading notebook');

            let data = new FormData(e.target);
            data.set('data', editor.serialize());
            
            DataManager.request({
                url: '/notebook/' + code,
                form: data,
                success: (r) => { UITerminal.addSavepoint(); },
                fail: (r) => { console.log(r) },
            });

            return false; 
        };
    }
}