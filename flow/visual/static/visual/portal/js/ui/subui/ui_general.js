'use strict';

class UIGeneral {

    static createAccept() {
        let agree = document.createElement('li');
        agree.innerHTML ='<img src="/static/visual/portal/icons/agree.svg">';
        agree.classList.add('action');
        agree.title = 'done';
        return agree;
    }

    static createDecline() {
        let decline = document.createElement('li');
        decline.innerHTML ='<img src="/static/visual/portal/icons/cancel.svg">';
        decline.classList.add('action');
        decline.title = 'cancel';
        return decline;
    }
    
}