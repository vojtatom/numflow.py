'use strict';

class UI {
    static menu(element = null, history = true) {
        console.log('loading menu');

        if (element !== null) {
            UI.component(element);

            if (history){
                History.addMenuHistory();
            }
        }

        //TODO
        UISidebar.create();

        let datasets = [...document.getElementsByClassName('dataset')]
        datasets.forEach(element => {
            UIDataset.create(element);
        });

        let notebooks = [...document.getElementsByClassName('notebook')]
        notebooks.forEach(element => {
            UINotebook.create(element);
        });

    }

    static notebook(element = null, history = true) {
        console.log('loading notebook');

        if (element !== null) {
            UI.component(element);

            if (history){
                History.addNotebookHistory();
            }
        }

    }

    static component(html) {
        let dom = document.getElementById('main');
        dom.innerHTML = html;
    }
}