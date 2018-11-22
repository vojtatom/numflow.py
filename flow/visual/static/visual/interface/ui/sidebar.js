'use strict';

class UISidebar {
    static create(element) {
        document.getElementById('sidebar_dataset_icon').onclick = function(e) {
            let dialog = document.getElementById('sidebar_dataset_upload');
            if (dialog.style.display == 'flex'){
                dialog.style.display = 'none';
                document.getElementById('dataset_upload_form').reset();
            } else
                dialog.style.display = 'flex';                    
        };

        document.getElementById('dataset_upload_form').onsubmit = function(e){
            e.preventDefault();
            console.log('uploading dataset', e.target);
    
            let data = new FormData(e.target);
            DataManager.upload({
                url: '/dataset/upload',
                data: data,
                success: (r) => { UI.menu(r, false) },
                fail: (r) => { console.log(r) },
            });
        };

        document.getElementById('dataset_upload_form_file').onchange = function(e){
            let fileName = e.target.value.split( '\\' ).pop();
            let label = e.target.labels[0];
            if(fileName){
                if(fileName.length > 20)
                    fileName = fileName.substring(0,10) + '...';
                label.innerHTML = fileName;
                label.classList.add('selected');
            }
        };

        document.getElementById('sidebar_notebook_icon').onclick = function(e) {
            DataManager.request({
                url: '/notebook/create',
                success : (r) => { UI.notebook(r); },
                fail: (r) => { console.log(r); },
            })
        }
    }
}