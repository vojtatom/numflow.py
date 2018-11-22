'use strict';

class UIFileEdit {
    static create(file, url_rename, reconstruct_call) {
        let edit_element = file.getElementsByClassName('edit')[0];
        edit_element.onclick = function(e) {
            let title = file.title;
            let code = file.id
            let insides = file.innerHTML;
    
            file.innerHTML = '';
            file.classList.add('active');
            file.classList.add('editing');

            //SUBMIT USED TWICE
            let submit_call = (e) => {
                e.preventDefault();
                let title = document.getElementById('input_title_' + code).value;
                DataManager.request({
                    url: url_rename,
                    data: {'code': code, 'title': title },
                    success: (r) => { 
                        file.innerHTML = insides;
                        let title_element = file.getElementsByClassName('title')[0];
                        title_element.innerHTML = title;
                        file.title = title;
                        file.classList.remove('active');
                        file.classList.remove('editing');
                        reconstruct_call(file);
                    },
                    fail: (r) => { console.log(r) },
                });
                return false;
            };
    
            file.appendChild(UIFileEdit.createInput(title, code, submit_call));
            file.getElementsByTagName('input')[0].focus();
            file.appendChild(UIFileEdit.createAccept(submit_call));
            file.appendChild(UIFileEdit.createDecline(file, insides, reconstruct_call));
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

    static createDecline(file, insides, reconstruct_call) {
        let decline = UIGeneral.createDecline();
        decline.onclick = (e) => {
            file.innerHTML = insides;
            file.classList.remove('active');
            file.classList.remove('editing');
            reconstruct_call(file);
        }

        return decline;
    }
}