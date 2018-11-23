'use strict';

class UINotebookForm {
    static onsubmit(form, code) {

        form.onsubmit = function(e) {
            e.preventDefault();
            console.log('uploading notebook');

            let data = new FormData(e.target);
            DataManager.request({
                url: '/notebook/' + code,
                form: data,
                success: (r) => { UI.notebook(r, false) },
                fail: (r) => { console.log(r) },
            });

            return false; 
        };
    }
}