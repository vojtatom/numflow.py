'use strict';

class UIFile {
    static create(file) {
        let triggers = [...file.parentElement.parentElement.getElementsByClassName('detail_trigger')];
        triggers.forEach(element => {
            element.onclick = UIFile.detail;
        });
    }

    static detail(e) {
        let detail = this.parentElement.parentElement.getElementsByClassName('detail')[0];
        if (detail.style.display == 'block'){
            detail.style.display = 'none';
            this.parentElement.classList.remove('active');
        } else {
            detail.style.display = 'block';           
            this.parentElement.classList.add('active');
        }
    }

    static disableBackups(file) {
        let backups = [...file.getElementsByClassName('backup')];
        backups.forEach(element => {
            element.onclick = function(e) {
                e.preventDefault();
                return false;
            };
        }); 
    }

}