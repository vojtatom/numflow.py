'use strict';

class History {
    static baseURL() {
        let getUrl = window.location;
        let url = getUrl.protocol + "//" + getUrl.host + "/";
        return url;
    }

    static addNotebookHistory() {
        let code = document.getElementById('code').value;
        let url = History.baseURL() + 'notebook/' + code;
        History.addHistory(url, {
            call: 'notebook',
            code: code
        });
    }

    static addMenuHistory() {
        let url = History.baseURL();
        History.addHistory(url, {
            call: 'menu'
        });
    }

    static addHistory(url, options) {
        if (Cookies.get('page') == url)
            return;
        window.history.pushState(options, "", url);
        Cookies.set('page', url);
    }
}


window.addEventListener('popstate', function(e) {
    if (e.state.call == 'menu'){
        DataManager.request({
            url: '/component/menu',
            success: (r) => { UI.menu(r, false); },
            fail: (r) => { console.log(r); }
        });

    } else if (e.state.call == 'notebook'){
        DataManager.request({
            url: '/component/notebook/' + e.state.code,
            success: (r) => { UI.notebook(r, false); },
            fail: (r) => { console.log(r); }
        });
    }
});