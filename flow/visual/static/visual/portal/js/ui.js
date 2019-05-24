'use strict';

/**
 * Class managing the portal UI
 */
class UI {
    /**
     * Routine setting up callbacks for the main page. 
     * @param {HTML element} element the HTML element of the main page
     * @param {Bool} history indicates wheteher a history record should be made
     */
    static index(element = null, history = true) {
        console.log('loading menu');

        UI.homeLink();

        if (element !== null) {
            UI.component(element);

            if (history){
                History.addIndexHistory();
            }
        }

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

    /**
     * Routine setting up callbacks for the notebook page. 
     * @param {*} element the HTML element of the main page
     * @param {*} history indicates wheteher a history record should be made
     */
    static notebook(element = null, history = true) {
        //console.log('loading notebook');

        UI.homeLink();

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


    /**
     * Routine setting up callbacks for the documentation page. 
     * @param {*} element the HTML element of the docs page
     * @param {*} history indicates wheteher a history record should be made
     */
    static docs(element = null, history = true) {
        //console.log('loading docs');

        UI.homeLink();

        if (element !== null) {
            UI.component(element);

            if (history){
                History.addDocsHistory();
            }
        }

        UIHeader.create();
    }

    /**
     * Inster the element into the displayed screen.
     * @param {HTML element} html Html element to be inserted
     */
    static component(html) {
        let dom = document.getElementById('main');
        dom.innerHTML = html;
    }

    /**
     * Set up on home link for the top left icon on each screen.
     */
    static homeLink(){
        let home = document.getElementById('home-link');
        home.onclick = (e) => {
            DataManager.request({
                method: 'GET',
                url: '/',
                success: (r) => {                 
                    UI.index(r);
                },
                fail: (r) => { console.error(r); }
            });

            e.preventDefault();
            return false;
        }
    }

}