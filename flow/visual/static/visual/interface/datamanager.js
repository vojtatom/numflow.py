'use strict';

class DataManager {
/*     deleteDataset() {
        this.request(options);
    } */

    static requestComponent(options){
        this.request(options);
    }

 /*    requestFrequent(options) {
        if (this.changeTimer !== false)
            clearTimeout(this.changeTimer);

        this.changeTimer = setTimeout(() => {
            return this.request(options);
        }, 300);
    }

    requestJson(options) {
        options.data = JSON.stringify(options.data)
        options.success = (response) => {
            response = JSON.parse(request.responseText);
            options.success(response);
            }
        options.headers = ['Content-type', 'application/json'];
        this.request(options);
    } */

    static request(options) {
        let request = new XMLHttpRequest();
        let token = Cookies.get('csrftoken');

        request.open('POST', options.url, true);
        request.setRequestHeader('X-CSRFTOKEN', token);

        request.onload = function () {
            if (request.status === 200) {
                options.success(request.responseText, request.responseURL);
            } else {
                options.fail(request.responseText);
            }
        };

        if ("headers" in options)
            request.setRequestHeader(...options.headers);

        if('data' in options){
            let data = JSON.stringify(options.data);
            request.send(data);
        } else {
            request.send();
        }
    }

    static upload(options) {
        let request = new XMLHttpRequest();
        let token = Cookies.get('csrftoken');

        request.open('POST', options.url, true);
        request.setRequestHeader('X-CSRFTOKEN', token);

        request.onload = function () {
            if (request.status === 200) {
                options.success(request.responseText, request.responseURL);
            } else {
                options.fail(request.responseText);
            }
        };

        if ("headers" in options)
            request.setRequestHeader(...options.headers);

        request.send(options.data);
    }

    /*uploadDataset(name, data) {
        event.preventDefault();
        let form = document.getElementById('media_upload'); 
        let formData = new FormData(form);
        request(formData, '/blog/image-upload/', (r) => { console.log(r)}, (r) => { console.log(r)});
    }*/
}
