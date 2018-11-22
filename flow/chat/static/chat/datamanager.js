'use strict';

class ChatDataManager {
    constructor() {
        if (!ChatDataManager.instance) {
            ChatDataManager.instance = this;
            this.changeTimer = false;
        }

        return ChatDataManager.instance;
    }

    requestFrequent(jsondata, url, callSuccess, callFail) {
        if (this.changeTimer !== false)
            clearTimeout(this.changeTimer);

        this.changeTimer = setTimeout(() => {
            return this.request(jsondata, url, callSuccess, callFail);
        },
            300);
    }

    request(jsondata, url, callSuccess, callFail) {

        let request = new XMLHttpRequest();
        request.open('POST', url, true);
        request.setRequestHeader('Content-type', 'application/json');
        request.setRequestHeader('X-CSRFTOKEN', token);

        request.onload = function () {
            if (request.status === 200) {
                let response = JSON.parse(request.responseText);
                callSuccess(response);
                response = null;
            } else {
                callFail(response);
                response = null;
            }
        };

        request.send(JSON.stringify(jsondata));
    }

    get(url) {
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
                reject(Error('Network Error'));
            };

            request.send();
        });
    }

    post(jsondata, url) {
        console.log(jsondata);
        let request = new XMLHttpRequest();
        request.open('POST', url, true);
        request.setRequestHeader('Content-type', 'application/json');
        request.setRequestHeader('X-CSRFTOKEN', token);
        request.send(JSON.stringify(jsondata));
    }
}
