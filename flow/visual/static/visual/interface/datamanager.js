'use strict';

class DataManager {

 /*    requestFrequent(options) {
        if (this.changeTimer !== false)
            clearTimeout(this.changeTimer);

        this.changeTimer = setTimeout(() => {
            return this.request(options);
        }, 300);
    }*/

    requestJson(options) {
        options.success = (response, url) => {
            response = JSON.parse(request.responseText);
            options.success(response, url);
        }

        this.request(options);
    }

    static request(options) {
        if (!('method' in options))
            options['method'] = 'POST';

        let request = new XMLHttpRequest();
        let token = Cookies.get('csrftoken');

        request.open(options.method, options.url, true);
        request.setRequestHeader('X-CSRFTOKEN', token);
        request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

        request.onload = function () {
            if (request.status === 200) {
                options.success(request.responseText, request.responseURL);
            } else {
                options.fail(request.responseText);
            }
        };

        if ('headers' in options)
            request.setRequestHeader(...options.headers);

        if('data' in options){
            let data = JSON.stringify(options.data);
            request.setRequestHeader('Content-type', 'application/json');
            request.send(data);
        } else if ('form' in options) {
            request.send(options.form);
        } else {
            request.send();
        }
    }

    static upload(options) {
        let request = new XMLHttpRequest();
        let token = Cookies.get('csrftoken');

        request.open('POST', options.url, true);
        request.setRequestHeader('X-CSRFTOKEN', token);
        request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

        request.onload = function () {
            if (request.status === 200) {
                options.success(request.responseText, request.responseURL);
            } else {
                options.fail(request.responseText);
            }
        };

        request.send(options.data);
    }
}
