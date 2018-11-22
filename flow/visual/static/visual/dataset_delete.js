'use strict';

class UIDatasetDelete {
    static create(dataset) {
        let delete_element = dataset.getElementsByClassName('dataset_delete')[0];
        delete_element.onclick = function(e) {
            let title = this.parentElement.title;
            let code = this.parentElement.id
            let file = this.parentElement;
            let insides = file.innerHTML;
    
            file.innerHTML = '';
            file.classList.add('active');
    
            file.appendChild(UIDatasetDelete.createText(title));
            file.appendChild(UIDatasetDelete.createAccept(file, code));
            file.appendChild(UIDatasetDelete.createDecline(file, insides));
        };
    }

    static createText(title) {
        let text = document.createElement('li');
        text.innerHTML = 'delete ' + title + '?';
        text.classList.add('title');

        return text;
    }

    static createAccept(file, code) {
        let agree = UIGeneral.createAccept();
        
        agree.onclick = (e) => {
            DataManager.request({
                url: '/delete/dataset/' + code,
                success: (r) => { file.parentElement.parentElement.removeChild(file.parentElement); },
                fail: (r) => { console.log(r) },
            });
        }

        return agree;
    }

    static createDecline(file, insides) {
        let decline = UIGeneral.createDecline();

        decline.onclick = (e) => {
            file.innerHTML = insides;
            file.classList.remove('active');
            UIDataset.create(file);
        }

        return decline;
    }
}