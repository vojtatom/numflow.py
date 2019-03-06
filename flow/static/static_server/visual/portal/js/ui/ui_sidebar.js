'use strict';

class UISidebar {
    static create(element) {

        //dataset
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
                url: '/dataset/upload',
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
        
        //upload notebook
        document.getElementById('sidebar_upload_notebook_icon').onclick = function(e) {
            let dialog = document.getElementById('sidebar_notebook_upload');
            if (dialog.style.display == 'flex'){
                dialog.style.display = 'none';
                document.getElementById('notebook_upload_form').reset();
            } else
                dialog.style.display = 'flex';                    
        };

        document.getElementById('notebook_upload_form_file').onchange = function(e){
            let fileName = e.target.value.split( '\\' ).pop();
            let label = e.target.labels[0];
            if(fileName){
                if(fileName.length > 20)
                    fileName = fileName.substring(0,10) + '...';
                label.innerHTML = fileName;
                label.classList.add('selected');
            }
        };

        document.getElementById('notebook_upload_form').onsubmit = function(e){
            e.preventDefault();
            let data = new FormData(e.target);
            let fileinput = document.getElementById('notebook_upload_form_file');
            DataManager.readFile({
                file: fileinput.files,
                success: (contents) => {
                    data.set('data', contents);
                    DataManager.upload({
                        url: '/notebook/upload',
                        data: data,
                        success: (r) => { UI.index(r, false) },
                        fail: (r) => { console.error(r) },
                    });
                },
                fail: (e) => { console.error(e); },
            });

            return false;
        };

        //new notebook
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