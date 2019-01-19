'use strict';

class DataManager {

    static requestFrequent(options) {
           if (DataManager.changeTimer !== false)
               clearTimeout(DataManager.changeTimer);
   
               DataManager.changeTimer = setTimeout(() => {
               return DataManager.request(options);
           }, 300);
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
                let response = request.responseText;
                if ('decode' in options && options.decode)
                    response = JSON.parse(response);
                options.success(response, request.responseURL);
            } else {
                options.fail(request.responseText);
            }
        };

        if ('headers' in options)
            request.setRequestHeader(...options.headers);

        if ('data' in options) {
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

    static files(options) {
        let requests = [];

        for (let file of options.files) {
            requests.push(DataManager.getPromise(file));
        }

        Promise.all(requests).then(
            options.success,
            options.fail,
        );
    }

    static getPromise(url) {
        return new Promise(function (resolve, reject) {
            var request = new XMLHttpRequest();
            request.open('GET', url);

            request.onload = function () {
                if (request.status == 200) {
                    resolve(request.response);
                }
                else {
                    reject(Error(request.statusText));
                }
            };

            request.onerror = function () {
                reject(Error("Network Error"));
            };

            request.send();
        });
    }
}
