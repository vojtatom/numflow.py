'use strict';

class UI {
    static index(element = null, history = true) {
        //console.log('loading menu');

        if (element !== null) {
            UI.component(element);

            if (history){
                History.addIndexHistory();
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
            UINotebook.createRecord(element);
        });

        UIHeader.create();

    }

    static notebook(element = null, history = true) {
        //console.log('loading notebook');

        if (element !== null) {
            UI.component(element);

            if (history){
                History.addNotebookHistory();
            }
        }

        UIHeader.create();
        let editor = UINotebook.createEditor();
        UITerminal.create(editor);
    }


    static docs(element = null, history = true) {
        //console.log('loading docs');

        if (element !== null) {
            UI.component(element);

            if (history){
                History.addDocsHistory();
            }
        }

        UIHeader.create();
    }

    static component(html) {
        let dom = document.getElementById('main');
        dom.innerHTML = html;
    }

}