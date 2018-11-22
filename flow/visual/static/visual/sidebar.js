'use strict';

class UISidebar {
    static create(element) {
        document.getElementById('sidebar_upload_icon').onclick = function(e) {
            let dialog = document.getElementById('sidebar_upload');
            if (dialog.style.display == 'flex'){
                dialog.style.display = 'none';
                document.getElementById('upload_form').reset();
            } else
                dialog.style.display = 'flex';                    
        };

        document.getElementById('upload_form').onsubmit = function(e){
            e.preventDefault();
            console.log('uploading dataset', e.target);
    
            let data = new FormData(e.target);
            DataManager.upload({
                url: '/upload',
                data: data,
                success: (r) => { UI.menu(r) },
                fail: (r) => { console.log(r) },
            });
        };

        document.getElementById('upload_form_file').onchange = function(e){
            let fileName = e.target.value.split( '\\' ).pop();
            let label = e.target.labels[0];
            if(fileName){
                if(fileName.length > 20)
                    fileName = fileName.substring(0,10) + '...';
                label.innerHTML = fileName
                label.classList.add('selected')
            }
        };
    }
}