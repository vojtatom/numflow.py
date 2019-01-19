'use strict';

class UIHeader {
    static create() {
        let header = document.getElementById('header');
        let docLink = document.getElementById('header_docs_link');

        docLink.onclick = function(e){
            e.preventDefault();

            DataManager.request({
                method: 'GET',
                url: '/docs/',
                success: (r) => {                   
                    UI.docs(r);
                },
                fail: (r) => { console.log(r); }
            })
        }
    }
}