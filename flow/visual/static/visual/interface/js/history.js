'use strict';

class History {
    static baseURL() {
        let getUrl = window.location;
        let url = getUrl.protocol + "//" + getUrl.host + "/";
        return url;
    }

    static addIndexHistory() {
        let url = History.baseURL();
        History.addHistory(url, {
            call: 'index'
        });
    }
    
    static addNotebookHistory() {
        let code = document.getElementById('code').value;
        let url = History.baseURL() + 'notebook/' + code;
        History.addHistory(url, {
            call: 'notebook',
            code: code
        });
    }

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
            fail: (r) => { console.log(r); }
        });

    } else if (e.state.call == 'notebook'){
        DataManager.request({
            url: '/notebook/' + e.state.code,
            method: 'GET',
            success: (r) => { 
                UI.notebook(r, false);
                Cookies.set('flow_page', e.state.url);
            },
            fail: (r) => { console.log(r); }
        });
    }
});