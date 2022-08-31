'use strict';

class UIFileDelete {
    static create(file, url_delete, reconstruct_call) {
        let delete_element = file.getElementsByClassName('delete')[0];
        delete_element.onclick = function (e) {
            let title = file.title;
            let code = file.id
            let insides = file.innerHTML;

            file.innerHTML = '';
            file.classList.add('active');

            file.appendChild(UIFileDelete.createText(title));
            file.appendChild(UIFileDelete.createAccept(file, code, url_delete));
            file.appendChild(UIFileDelete.createDecline(file, insides, reconstruct_call));
        };
    }

    static createText(title) {
        let text = document.createElement('li');
        text.innerHTML = 'delete ' + title + '?';
        text.classList.add('title');

        return text;
    }

    static createAccept(file, code, url_delete) {
        let agree = UIGeneral.createAccept();

        agree.onclick = (e) => {
            DataManager.request({
                url: url_delete,
                data: { 'code': code },
                success: (r) => { file.parentElement.parentElement.removeChild(file.parentElement); },
                fail: (r) => { console.error(r) },
            });
        }

        return agree;
    }

    static createDecline(file, insides, reconstruct_call) {
        let decline = UIGeneral.createDecline();

        decline.onclick = (e) => {
            file.innerHTML = insides;
            file.classList.remove('active');
            reconstruct_call(file);
        }

        return decline;
    }
}