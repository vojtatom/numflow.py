'use strict';

/**
 * Class representing the history of the main singl-sceen application
 */
class History {
    /**
     * Get the base url form the current address
     */
    static baseURL() {
        let getUrl = window.location;
        let url = getUrl.protocol + "//" + getUrl.host + "/";
        return url;
    }

    /**
     * Add index page to the history.
     */
    static addIndexHistory() {
        let url = History.baseURL();
        History.addHistory(url, {
            call: 'index'
        });
    }

    /**
     * Add docs page to the history.
     */
    static addDocsHistory() {
        let url = History.baseURL() + 'docs/';
        History.addHistory(url, {
            call: 'docs'
        });
    }
   
    /**
     * Add Notebook page to the history.
     */
    static addNotebookHistory() {
        let code = document.getElementById('code').value;
        let url = History.baseURL() + 'notebook/' + code;
        History.addHistory(url, {
            call: 'notebook',
            code: code
        });
    }

    /**
     * Add a general history record to the browser history.
     * 
     * @param {string} url history url
     * @param {object} options history element
     */
    static addHistory(url, options) {
        if (Cookies.get('flow_page') == url)
            return;
        
        console.log('history made!', url)
        window.history.pushState(options, '', url);
        Cookies.set('flow_page', url);
    }
}


window.addEventListener('popstate', function(e) {
    if (e.state.call == 'index'){
        DataManager.request({
            url: '/',
            method: 'GET',
            success: (r) => {
                UI.index(r, false);
                Cookies.set('flow_page', e.state.url);
            },
            fail: (r) => { console.error(r); }
        });

    } else if (e.state.call == 'notebook'){
        DataManager.request({
            url: '/notebook/' + e.state.code,
            method: 'GET',
            success: (r) => { 
                UI.notebook(r, false);
                Cookies.set('flow_page', e.state.url);
            },
            fail: (r) => { console.error(r); }
        });
    } else if (e.state.call == 'docs'){
        DataManager.request({
            url: '/docs/',
            method: 'GET',
            success: (r) => { 
                UI.docs(r, false);
                Cookies.set('flow_page', e.state.url);
            },
            fail: (r) => { console.error(r); }
        });
    }
});