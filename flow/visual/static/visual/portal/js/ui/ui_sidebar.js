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
            //console.log('uploading dataset');
    
            let data = new FormData(e.target);
            DataManager.upload({
                url: '/',
                data: data,
                success: (r) => { UI.index(r, false) },
                fail: (r) => { console.error(r) },
            });

            return false;
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

        document.getElementById('sidebar_new_notebook_icon').onclick = function(e) {
            DataManager.request({
                method: 'GET',
                url: '/notebook/',
                success : (r) => { UI.notebook(r); },
                fail: (r) => { console.error(r); },
            })
        }

    }
}