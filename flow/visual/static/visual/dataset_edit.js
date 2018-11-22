'use strict';

class UIDatasetEdit {
    static create(dataset) {
        let edit_element = dataset.getElementsByClassName('dataset_edit')[0];
        edit_element.onclick = function(e) {
            let title = this.parentElement.title;
            let code = this.parentElement.id
            let file = this.parentElement;
            let insides = file.innerHTML;
    
            file.innerHTML = '';
            file.classList.add('active');
            file.classList.add('editing');

            //SUBMIT USED TWICE
            let submit_call = (e) => {
                e.preventDefault();
                let title = document.getElementById('input_title_' + code).value;
                DataManager.request({
                    url: '/rename/dataset',
                    data: {'code': code, 'title': title },
                    success: (r) => { 
                        file.innerHTML = insides;
                        let title_element = file.getElementsByClassName('title')[0];
                        title_element.innerHTML = title;
                        file.title = title;
                        file.classList.remove('active');
                        file.classList.remove('editing');
                        UIDataset.create(file);
                    },
                    fail: (r) => { console.log(r) },
                });
                return false;
            };
    
            file.appendChild(UIDatasetEdit.createInput(title, code, submit_call));
            file.getElementsByTagName('input')[0].focus();
            file.appendChild(UIDatasetEdit.createAccept(submit_call));
            file.appendChild(UIDatasetEdit.createDecline(file, insides));
        }


    }

    static createInput(title, code, submit_call) {
        let li = document.createElement('li');
        let form = document.createElement('form');
        let input = document.createElement('input');

        input.id = 'input_title_' + code;
        input.value = title;
        input.type = 'text';
        
        li.appendChild(form);
        form.appendChild(input);
        li.classList.add('input');

        form.onsubmit = submit_call;
        return li;
    }

    static createAccept(submit_call) {
        let agree = UIGeneral.createAccept();
        
        agree.onclick = submit_call;
        return agree;
    }

    static createDecline(file, insides) {
        let decline = UIGeneral.createDecline();
        decline.onclick = (e) => {
            file.innerHTML = insides;
            file.classList.remove('active');
            file.classList.remove('editing');
            UIDataset.create(file);
        }

        return decline;
    }
}