'use strict';

class UI {
    static menu(element = null) {
        console.log('loading menu');

        let setup = function(element) {
            UI.component(element);

            //TODO
            UISidebar.create();

            let datasets = [...document.getElementsByClassName('dataset')]
            datasets.forEach(element => {
                UIDataset.create(element);
            }); 
            
            
        };

        if (element === null) {
            DataManager.requestComponent({
                url: '/component/menu',
                success: (r) => { setup(r) },
                fail: (r) => { console.log(r) },
            });
        } else {
            setup(element);
        }
    }

    static component(html, dom = null, options) {
        if (dom == null)
            dom = document.getElementById('main');
        dom.innerHTML = html;
    }
/* 
    search(value) {
        let data = { query: value };

        this.dm.requestFrequent(
            data,
            '/visual/search/',
            this.showSearchResults,
            (e) => { console.log(e) }
        );
    }

    showSearchResults(data) {
        console.log(data);
    } */

}